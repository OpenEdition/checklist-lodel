<?php
class checklist extends Plugins {
	public function enableAction (&$context, &$error) {}

	public function disableAction (&$context, &$error) {}

	public function preview (&$context)	{
		if($context['view']['tpl'] != 'checklist' || !parent::_checkRights(LEVEL_REDACTOR)) return;
		C::set('view.base_rep.checklist', 'checklist');
	}

	public function postview (&$context) {
		$displayOnTpl = array("article", "sommaire", "entrees", "personnes");
		$tpl = $context['view']['tpl'];

		if(defined('backoffice-admin') || C::get('do') || C::get('lo') || !in_array($tpl, $displayOnTpl)) return;
		if(!parent::_checkRights(LEVEL_REDACTOR)) return;

		// Get page contents
		$page = View::$page;
		$dom = new DOMDocument;
		$dom->loadHTML($page);
		$finder = new DomXPath($dom);
		$ul = $finder->query('//*[@id="lodel-desk"]//*[contains(concat(" ",normalize-space(@class)," ")," group1 ")]')[0];

		// Create a "Checklist" item in Lodel tabs
		$li = $dom->createElement('li');
		$ul->appendChild($li);
		$a = $dom->createElement('a', 'Checklist');
		$href = $dom->createAttribute('href');
		$href->value = './?do=_checklist_view&amp;document=' . $context['id'];
		$a->appendChild($href);
		$li->appendChild($a);

		// Update page contents
		$page = $dom->saveHTML();
		View::$page = $page;
	}

	public function viewAction (&$context, &$error) {
		View::getView()->renderCached('checklist') ;
		return "_ajax" ;
	}
}
?>