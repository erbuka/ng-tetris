<?
    $file = fopen("highscores.json", "wt");
    fwrite($file, file_get_contents("php://input"));
    fclose($file);
?>