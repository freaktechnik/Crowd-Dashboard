<?php
    /**
     *  Crowd Dashboard detching script
     *  Created by Martin Giger in 2013
     *  Licensed under GPLv2
     */

    // get: source with trailing /

    $c = curl_init();
    curl_setopt($c, CURLOPT_URL, $_GET['source'].'servers.json');
    curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($c, CURLOPT_TIMEOUT, 30);
    curl_setopt($c, CURLOPT_FOLLOWLOCATION, 1);
    $data = curl_exec($c);

    if($data === false) {
        echo "Failed to fetch servers.json: ".curl_error($c);
    }
    else {
        $file = fopen("servers.json", 'w+');
        fwrite( $file, $data );
        fclose($file);

        echo "Sucessfully fetched servers.json from ".$_GET['source'];
    }

    curl_close($c);

    $d = curl_init();
    curl_setopt($d, CURLOPT_URL, $_GET['source'].'mirrors.json');
    curl_setopt($d, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($d, CURLOPT_TIMEOUT, 30);
    curl_setopt($d, CURLOPT_FOLLOWLOCATION, 1);
    $mirrors = curl_exec($d);

    if($mirrors === false) {
        echo "\nFailed to fetch mirrors.json: ".curl_error($d);
    }
    else {
        $json = json_decode($mirrors);
        $index = sizeof($json[0]->pages);
        $json[0]->pages[$index]->name = $_GET['source'];
        $json[0]->pages[$index]->url = $_GET['source'];

        $file = fopen("mirrors.json", 'w+');
        fwrite( $file, stripslashes(json_encode($json)) );
        fclose( $file );

        echo "\nSucessfully fetched mirrors.json from ".$_GET['source'];
    }

    curl_close($d);
?>
