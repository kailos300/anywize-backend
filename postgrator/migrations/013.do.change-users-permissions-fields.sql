UPDATE `users` SET `permissions` = JSON_INSERT(`permissions`, '$.showTourTab', true);
