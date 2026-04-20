<?php
// Destroy ONLY the user session — admin session stays intact
session_name('nk_user');
session_start();
session_destroy();
header('Location: index.php');
exit;
?>
