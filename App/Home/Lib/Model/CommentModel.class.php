<?php
class CommentModel extends RelationModel {
	public $_link = array(
		   'User'=> BELONGS_TO,
	);
	
	protected $_validate = array(
		array('content','require','标题不能为空！',Model::MUST_VALIDATE),
	);

	function getCommentLines($codereview_id, $file) {
		$Comment = M('Comment');
		return $Comment->field('line')->distinct(True)->where("codereview_id = $codereview_id and file = '$file'")->select();
	}

	function getCommentByCodereviewID($codereview_id) {
		$Comment = D('Comment');
		return $Comment->relation(true)->where("codereview_id = $codereview_id")->order('file asc, line asc, id asc')->select();
	}

	function getCountByFile($codereview_id, $file) {
		$Comment = M('Comment');
		return $Comment->where("codereview_id = $codereview_id and file = '$file'")->count(); 
	}

	function getCommentInfo($codereview_id) {
		$Comment = M('Comment');
		$lines = count($Comment->field('file, line')->where("codereview_id = $codereview_id")->distinct('True')->select());
		$comments = $Comment->where("codereview_id = $codereview_id")->count();
		return array(
			'line' => $lines,
			'comment' => $comments,
		);
	}

	function getCommentUserEmail($id, $file, $line) {
		$Comment = D('Comment');
		$comments = $Comment->relation(true)->where("codereview_id=$id and file='$file' and line=$line")->select();
		$mails = array();
		foreach($comments as $id=>$cmt) {
			if(!empty($cmt['User'])) {
				array_push($mails, $cmt['User']['email']);
			}
		}
		return $mails;
	}
}