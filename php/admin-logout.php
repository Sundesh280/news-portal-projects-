<?php
// Destroy ONLY the admin session — user session stays intact
session_name('nk_admin');
session_set_cookie_params(['path' => '/']);
session_start();
session_destroy();
header('Location: admin-login.php'); // go back to admin login page
exit;
?>
