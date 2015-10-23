<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$app->get('/user/{nickname}/{key}', function ($nickname,$key) use ($app) {
    $DBKey = DB::table('keys')->where('key','=',$key)->first();
	if($DBKey === null){
		App::abort(403,'Not Aollowed');
	}
	
	$user = DB::table('user_keys')->where('key',$key)->where('nickname',$nickname)->first();
	if($user === null){
		$user = [
			'nickname'=>$nickname,
			'key'=>$key,
			'ban'=>0,
		];
		
		DB::table('user_keys')->insert($user);
		$user['isNew'] = true;
	}
	
	return response()->json($user)->header('Access-Control-Allow-Origin','https://www.ingress.com');
});

$app->get('/message/{key}',function ($key) use($app) {
	$DBKey = DB::table('keys')->where('key','=',$key)->first();
	if($DBKey === null){
		App::abort(403,'Not Aollowed');
	}
	
	$message = DB::table('messages')->where('key',$key)->first();
	if($message === null){
		$message = [
			'daily'=>'',
			'welcome'=>'',
			'event'=>'',
			'eventDate'=>'',
		];
	}
	
	return response()->json($message)->header('Access-Control-Allow-Origin','https://www.ingress.com');
});

$app->get('/ban/{nickname}/{key}',function ($nickname,$key) use($app) {
	$DBKey = DB::table('keys')->where('key','=',$key)->first();
	if($DBKey === null){
		App::abort(403,'Not Aollowed');
	}
	$user = DB::table('user_keys')->where('key',$key)->where('nickname',$nickname)->update(['ban'=>true]);
	return response('')->header('Access-Control-Allow-Origin','https://www.ingress.com');
});

$app->get('/sent/{nickname}/{key}',function ($nickname,$key) use($app){
	$DBKey = DB::table('keys')->where('key','=',$key)->first();
	if($DBKey === null){
		App::abort(403,'Not Aollowed');
	}
	DB::table('user_keys')->where('key',$key)->where('nickname',$nickname)->update(['sent'=>true]);
	return response('')->header('Access-Control-Allow-Origin','https://www.ingress.com');
});