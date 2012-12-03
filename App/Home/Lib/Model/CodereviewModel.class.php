<?php
class CodereviewModel extends RelationModel {
	public $_link = array(
		   'User'=> BELONGS_TO,
	);

	function getCodereviews($type = 'all', $user_id = 0, $limit = 100) {
		$Codereview = D('Codereview');
		switch($type) {
			case 'star':
				return $Codereview->relation(true)->where("id in (select obj_id from think_favorite where obj_type = 1 and user_id = $user_id)")->order('id desc')->limit($limit)->select();
			case 'my':
				return $Codereview->relation(true)->where("user_id = $user_id")->order('id desc')->limit($limit)->select();
			default:
				return $Codereview->relation(true)->order('id desc')->limit($limit)->select();
		}
	}
}
?>