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
			header('HTTP/1.0 404 Not Found');
			header('Status: 404 Not Found');
			header('Connection: Close');
			$missing = C::get('home', 'cfg').'../../missing.php';
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
		$displayOnTpl = array('article', 'sommaire', 'entrees', 'personnes', 'checklist', 'edition', 'edit_entities_edition', 'entries', 'persons');
		$tpl = $context['view']['tpl'];

		if(!in_array($tpl, $displayOnTpl) || !parent::_checkRights(LEVEL_REDACTOR)) return;

		$page = View::$page;
		$doc_id = (($tpl == 'entries' || $tpl == 'persons') ? $context['idtype'] : $context['id']);
		$class_attr = ' ';

		// If Checklist is active
		if ($tpl == 'checklist') {
			$doc_id = $_GET['document'];
			$class_attr = ' class="actif"';

			// Deactivate active tab
			$re = '/(<ul *class="group1">)(.*)(?>class="actif")(.*)(<\/ul>)/Us';
			$replacement = '$1$2$3$4';
			$page = preg_replace($re, $replacement, $page);
		}

		if (!$doc_id || $doc_id == 0) return;

		// Add a "Checklist" tab
		$re = '/<li>\R?<a href="[.\/]*lodel\/admin\/index\.php\?do=list&amp;lo=internal_messaging" title="[^"]*">[^<]*<\/a>\R?<\/li>/m';
		$replacement = '\0<li><a href="./?do=_checklist_view&amp;document=' . $doc_id . '" title="Checklist"' . $class_attr . '>Checklist</a></li>';
		$page = preg_replace($re, $replacement, $page);

		View::$page = $page;
	}

	public function viewAction (&$context, &$error) {
		View::getView()->renderCached('checklist') ;
		return '_ajax' ;
	}
}
?>