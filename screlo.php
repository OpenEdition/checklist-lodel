<?php
class checklist extends Plugins
{
	public function enableAction(&$context, &$error) {}
	public function disableAction(&$context, &$error) {}

	public function postview(&$context)
	{
		// URL du script
		$checklistUrl = 'path/to/checklist';

		// checklist est actif a partir du niveau redacteur
		if(!parent::_checkRights(LEVEL_REDACTOR) || defined('backoffice-admin')) { return; }

		// on recupere le contenu de la page
		$page = View::$page;

		$dom = new DOMDocument;
		$dom->loadHTML($page);
		$head = iterator_to_array($dom->getElementsByTagName('head'))[0];

		// injection du script
		$scriptEl = $dom->createElement('script');
		$scriptAttr = $dom->createAttribute('src');
		$scriptAttr->value = $checklistUrl;
		$scriptEl->appendChild($scriptAttr);
		$head->appendChild($scriptEl);

		// on remplace le contenu de la page dans la vue
		$page = $dom->saveHTML();
		View::$page = $page;
	}
}
?>
