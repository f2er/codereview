<?php
class CodereviewAction extends BaseAction{
	function _initialize() {
		parent::_initialize();
		$this->needLogin();

		$this->_sys_name = 'codereview';
		$this->_menu = array(
			'Review列表' => array(
				'我收藏的'	=> U('codereview/lst?t=star'),
				'我发起的'	=> U('codereview/lst?t=my'),
				'全部Review'	=> U('codereview/lst?t=all'),
			),
			'Review管理' => array(
				'发起Review'	=> U('codereview/add'),
			),
		);
		$this->_upload_dir = C('UPLOAD_DIR');
	}

    function index() {
        $this->display();
    }

	function lst() {
		$Codereview = D('Codereview');
		$Comment = D('Comment');
		$type = $_GET['t'];
		$type = empty($type) ? 'all' : $type;
		$this->_cur_url = U("codereview/lst?t=$type");
		$page_title = array(
				'star'	=> '我收藏的Review',
				'my'	=> '我发起的Review',
				'all'	=> '全部Review',
			);
		$this->title = $page_title[$type];
		$this->type = $type;
		$data = $Codereview->getCodereviews($type, $this->_user['id']);
		$Favorite = M('Favorite');
		$user_id = $this->_user['id'];
		foreach($data as &$item) {
			$codereview_id = $item['id'];
			$item['favorite'] = $Favorite->where("obj_id = $codereview_id and user_id = $user_id")->find();
			$item['count'] = $Comment->getCommentInfo($codereview_id);
		}
		$this->data = $data;
        $this->display();
	}

	function add() {
		if($this->isPOST()) {
			$Codereview = D('Codereview');
			if($Codereview->create()) {
				$Codereview->user_id = $this->_user['id'];
				import("ORG.Net.UploadFile");
				$upload = new UploadFile();
				$upload->saveRule = 'time';
				$upload->allowExts  = array('zip');
				$upload->savePath = C('UPLOAD_DIR') .'/_tmp/';
				if(!$upload->upload()) {
					exit($upload->getErrorMsg());
				} else {
					$info = $upload->getUploadFileInfo();
					$path = $upload->savePath. $info[0]['savename'];
					$Codereview->zippath = $info[0]['savename'];
					if($codereview_id = $Codereview->add()) {
						#vendor('phpZIP.zip');
						#$zip = new PHPZip();
						#$zip->unZip($path, C('UPLOAD_DIR') . '/' . $codereview_id);
						exec("unzip $path -d ". C('UPLOAD_DIR') . '/' . $codereview_id);
						$this->redirect('codereview/lst');
					} else {
						exit($Codereview->getError());
					}
				}
			} else {
				exit($Codereview->getError());
			}
		} else {
			$this->title = "发起CodeReview";
			$this->display();
		}
	}

	function codereview_delete() {
		$Codereview = M('Codereview');
		$id = $_POST['id'];
		$user_id = $this->_user['id'];
		$Codereview->where("id = $id and user_id = $user_id")->delete();
		$this->ajaxReturn(null, null, 1);
	}

	function codereview_cmt_lst() {
		$id = intval($_GET['id']);
		if($id <= 0) {
			throw new Exception('argument error, miss the id.');
		}
		$Codereview = M('Codereview');
		$codereview = $Codereview->find($id);
		$this->codereview = $codereview;

		$Comment = D('Comment');
		$all_comments = $Comment->getCommentByCodereviewID($id);
		$comments = array();
		foreach($all_comments as $comment) {
			$file = $comment['file'];
			$base64_file = base64_encode(C('UPLOAD_DIR') .'/'.$id. $file);
			if(empty($comments[$file])) {
				$comments[$file] = array('base64_file' => $base64_file, 'list' => array());
			}
			array_push($comments[$file]['list'], $comment);
		}
		$this->comments_count = $Comment->getCommentInfo($id);
		$this->comments = $comments;
		$this->title = "CodeReview - ".$codereview['title'];
		$this->display();
	}

	function codereview() {
		$id = intval($_GET['id']);
		if($id <= 0) {
			throw new Exception('argument error, miss the id.');
		}
		$file = base64_decode(trim($_GET['file']));

		$Codereview = M('Codereview');
		$codereview = $Codereview->find($id);

		if(empty($codereview)) {
			throw new Exception('data error, no data.');
		}
		
		$path_info = pathinfo($file);

		$this->id = $id;
		$this->title = "CodeReview - ".$codereview['title'];
		$this->file_content = file_get_contents($file);

		$this->file_ext = $path_info['extension'];
		$this->codereview = $codereview;

		$file = str_replace(C('UPLOAD_DIR') .'/'.$id, '', $file);
		$this->file = $file;

		$Comment = D('Comment');
		$this->lines = $Comment->getCommentLines($id, $file);

		$user_id = $this->_user['id'];
		$Favorite = M('Favorite');
		$this->favorite = $Favorite->where("obj_id = $id and user_id = $user_id")->find();

		$default_line = -1;
		if(!empty($_GET['line'])) {
			$default_line = intval($_GET['line']);
		}
		$this->default_line = $default_line;

		$this->display();
	}

	function comment_list() {
		$Comment = D('Comment');
		$file = $_POST['file'];
		$id = $_POST['id'];
		$line = $_POST['line'];
		$data = $Comment->relation(true)->where("codereview_id = $id and line = $line and file = '$file'")->order('id asc')->select();
		$this->data = $data;
		$this->display();
	}

	function comment_delete() {
		$Comment = M('Comment');
		$id = $_POST['id'];
		$user_id = $this->_user['id'];
		$Comment->where("id = $id and user_id = $user_id")->delete();
		$this->ajaxReturn(null, null, 1);
	}

	function comment_add() {
		$Comment = D('Comment');
		if($Comment->create()) {
			$Comment->user_id = $this->_user['id'];
			if($Comment->add()) {
				
				$id = $Comment->codereview_id;
				$file = $Comment->file;
				$line = $Comment->line;
				$content = $Comment->content;
				$me = $this->_user['username'];
				$base64_file = base64_encode(C('UPLOAD_DIR') .'/'.$id. $file);
				$url = "http://360.75team.com".U("codereview/codereview?id=$id"). "?file=$base64_file&line=$line";

				//本行其他评论人
				$mails = $Comment->getCommentUserEmail($id, $file, $line);

				//加上codereview发起人
				$User = M('User');
				$Codereview = M('Codereview');
				$Codereview->find($id);

				$User->find($Codereview->user_id);
				array_push($mails, $User->email);

				//除重，并且排除自己
				$mails = array_unique($mails);
				$index = array_search($this->_user['email'], $mails);

				if($index !== false) {
					unset($mails[$index]);
				}

				foreach($mails as $mail) {					
					$Email = M('Email');
					$Email->to = $mail;
					$Email->url = $url;
					$Email->add();
				}
				
				$this->ajaxReturn(null, null, 1);
			} else {
				$this->ajaxReturn(null, '添加失败！', 0);
			}
		} else {
			$this->ajaxReturn(null, $Comment->getError(), 0);
		}
	}

	function favorite_act() {
		$act = $_POST['act'];
		$Favorite = M('Favorite');
		$obj_id = $_POST['obj_id'];
		$user_id = $this->_user['id'];
		if($act == 'add') {
			$Favorite->obj_id = $obj_id;
			$Favorite->user_id = $user_id;
			$Favorite->add(null, null, true);
		} else {
			$Favorite->where("obj_id = $obj_id and user_id = $user_id")->delete();
		}
		$this->ajaxReturn(null, null, 1);
	}

	function file_list() {
		$path = $_GET['path'];
		$id = $_GET['id'];
		if(is_numeric($path)) {
			$path = C('UPLOAD_DIR') .'/'.$path;
		} else {
			$path = base64_decode($path);
		}

		$data_folder = array();
		$data_file = array();
		$info = scandir($path);
		$Comment = D('Comment');
		foreach($info as $i => $item) {
			if(strpos($item, '.') === 0 || strpos($item, '__') === 0) continue; //.、__开头的文件、文件夹直接不显示
			$full_path = $path . '/'. $item;
			$path_info = pathinfo($full_path);
			$item_info = array(
					'id'		=> $i,
					'path'		=> base64_encode($full_path),
					'name'		=> $item,
					'isleaf'	=> 1,
					'ext'		=> $path_info['extension'],
				);
			if(is_dir($full_path)) {
				$item_info['isleaf'] = 0;
				array_push($data_folder, $item_info);
			} else {
				$file = str_replace(C('UPLOAD_DIR') .'/'.$id, '', $full_path);
				$item_info['comments'] = $Comment->getCountByFile($id, $file);
				array_push($data_file, $item_info);
			}
		}
		$data = array_merge($data_folder, $data_file);
		$this->ajaxReturn($data, null, 1);
	}
}