<?php
class checklist extends Plugins {
	public function enableAction (&$context, &$error) {
		if(!parent::_checkRights(LEVEL_ADMINLODEL)) { return; }
	}

	public function disableAction (&$context, &$error) {
		if(!parent::_checkRights(LEVEL_ADMINLODEL)) { return; }
	}

	public function preview (&$context)	{
		$tpl = $context['view']['tpl'];
		if ($tpl != 'checklist' && $tpl != 'checklist_get') return;
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
		C::set('view.base_rep.' . $tpl, 'checklist');

		// Plugin options
		$checklist_open_batch = $this->_config['checklist_open_batch']['value'];
		C::set('checklist_open_batch', $checklist_open_batch);

		$checklist_em = $this->_config['checklist_em']['value'];
		C::set('checklist_em', $checklist_em);
	}

	public function postview (&$context) {
		if(!parent::_checkRights(LEVEL_REDACTOR)) return;
		
		$page = View::$page;
		$tpl = $context['view']['tpl'];
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

		// Add a "Checklist" tab
		$re = '/<li>\R?<a href="[.\/]*lodel\/admin\/index\.php\?do=list&amp;lo=internal_messaging" title="[^"]*">[^<]*<\/a>\R?<\/li>/m';
		$replacement = '\0<li><a href="' . $context['siteurl'] . '/?do=_checklist_view&amp;document=' . $doc_id . '" title="Checklist"' . $class_attr . '>Checklist</a></li>';
		$page = preg_replace($re, $replacement, $page);

		View::$page = $page;
	}

	public function viewAction (&$context, &$error) {
		View::getView()->renderCached('checklist') ;
		return '_ajax' ;
	}

	public function getAction (&$context, &$error) {
		View::getView()->renderCached('checklist_get') ;
		return '_ajax' ;
	}
}
?>