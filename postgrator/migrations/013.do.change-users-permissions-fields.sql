UPDATE `users` SET `permissions` = JSON_INSERT(`permissions`, '$.showTourTab', true);
UPDATE `users` SET `permissions` = JSON_INSERT(`permissions`, '$.showMasterData', true);
