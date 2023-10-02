ALTER TABLE `users` ADD `permissions` JSON NULL AFTER `admin`;
UPDATE `users` SET `permissions` = JSON_OBJECT(
        "routesList", true,
        "routesMap", true,
        "routesCreateForDriver", true,
        "routesCreateDeliveryOrder", false,
        "ordersList", true,
        "ordersListSupplier", true,
        "ordersCreate", true,
        "customersCreate", true,
        "toursCreate", true
);

ALTER TABLE `orders` ADD `created_by_user_id` INT NULL AFTER `route_id`, ADD INDEX (`created_by_user_id`);
