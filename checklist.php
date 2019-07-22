<?php
class checklist extends Plugins {
	public function enableAction (&$context, &$error) {
		if(!parent::_checkRights(LEVEL_ADMINLODEL)) { return; }
	}

	public function disableAction (&$context, &$error) {
		if(!parent::_checkRights(LEVEL_ADMINLODEL)) { return; }
	}

	public function preview (&$context)	{
		if ($context['view']['tpl'] != 'checklist') return;
		if (!parent::_checkRights(LEVEL_REDACTOR)) {
			header("HTTP/1.0 404 Not Found");
			header("Status: 404 Not Found");
			header("Connection: Close");
			$missing = C::get('home', 'cfg')."../../missing.php";
			if (file_exists($missing)) {
				include $missing;
			} else {
				header('Location: not-found.html');
			}
			exit;
		}
		C::set('view.base_rep.checklist', 'checklist');
	}

	public function postview (&$context) {
		$displayOnTpl = array("article", "sommaire", "entrees", "personnes", "checklist");
		$tpl = $context['view']['tpl'];

		if(defined('backoffice') || !in_array($tpl, $displayOnTpl) || !parent::_checkRights(LEVEL_REDACTOR)) return;

		// Get page contents
		$page = View::$page;
		$dom = new DOMDocument;

		// Avoid errors with invalid HTML when using DOMDocument::loadHTML()
		$internalErrors = libxml_use_internal_errors(true);
		$dom->loadHTML($page);
		libxml_use_internal_errors($internalErrors);
		
		// Create a "Checklist" item in Lodel tabs
		$finder = new DomXPath($dom);
		$uls = $finder->query('//*[@id="lodel-desk"]//*[contains(concat(" ",normalize-space(@class)," ")," group1 ")]');
		if ($uls->length == 0) {
			return;
		}
		$ul = $uls[0];
		$li = $dom->createElement('li');
		$ul->appendChild($li);
		$a = $dom->createElement('a', 'Checklist');
		$href = $dom->createAttribute('href');
		$href->value = './?do=_checklist_view&amp;document=' . $context['id'];

		// If Checklist is active
		if ($tpl == 'checklist') {
			// Deactivate other tabs
			$actifs = $finder->query('.//*[@id="lodel-desk"]//*[contains(concat(" ",normalize-space(@class)," ")," group1 ")]//li//a[contains(concat(" ",normalize-space(@class)," ")," actif ")]');
			foreach ($actifs as $el) {
				$el->removeAttribute('class');
			}
			
			// Change Checklist tab href and class
			$href->value = './?index.php&amp;id=' . $_GET['document'];
			$classname = $dom->createAttribute('class');
			$classname->value = 'actif';
			$a->appendChild($classname);
		}

		// Update page contents
		$a->appendChild($href);
		$li->appendChild($a);
		$page = $dom->saveHTML();
		View::$page = $page;
	}

	public function viewAction (&$context, &$error) {
		View::getView()->renderCached('checklist') ;
		return "_ajax" ;
	}
}
?>