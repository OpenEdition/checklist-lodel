<?php
class checklist extends Plugins {
	public function enableAction (&$context, &$error) {}

	public function disableAction (&$context, &$error) {}

	public function preview (&$context)	{
		if(!defined('backoffice') || $context['view']['tpl'] != 'checklist' || !parent::_checkRights(LEVEL_REDACTOR)) return;
		C::set('view.base_rep.checklist', 'checklist');
	}

	public function postview (&$context) {
		if(!defined('backoffice-admin') || C::get('do') || C::get('lo') || ($context['view']['tpl'] != 'index')) return;
		if(!parent::_checkRights(LEVEL_REDACTOR)) return;

		$pattern = '/Plugins<\/a><\/li>/';
		$replacement = '$0<li><a href="./?do=_checklist_view">Checklist</a></li>';
		View::$page = preg_replace($pattern, $replacement, View::$page);
	}

	public function viewAction (&$context, &$error) {
		View::getView()->renderCached('checklist') ;
		return "_ajax" ;
	}
}
?>