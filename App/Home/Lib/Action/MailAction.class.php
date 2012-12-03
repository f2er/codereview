<?php
class MailAction extends BaseAction{
    function index() {
    	$Email = M('Email');
    	$mails = $Email->where('status=0')->select();

        $new_mails = array();
    	foreach($mails as $mail) {
    		$id = $mail['id'];
            $to = $mail['to'];
            $url = $mail['url'];

            if(empty($new_mails[$to])) {
                $new_mails[$to] = array();
            }
            array_push($new_mails[$to], $url);
    		
            $Email = M('Email');
    		$Email->find($id);
    		$Email->status = 1;
    		$Email->save();
    	}

        foreach($new_mails as $to => $urls) {
            $subject = "=?UTF-8?B?". base64_encode("[CodeReview]有新评论啦"). "?="; 
            $headers = "MIME-Version: 1.0". "\r\n"; 
            $headers .= "Content-type: text/html; charset=utf-8\r\n"; // Additional headers 
            mail($to, $subject, implode("<br><br>", $urls), $headers);
        }

        echo 'ok';
    }
}