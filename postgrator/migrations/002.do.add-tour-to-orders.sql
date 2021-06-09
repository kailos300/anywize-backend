ALTER TABLE `orders` ADD `route_id` INT NULL AFTER `customer_id`;
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_2` FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE `orders` ADD `supplier_id` INT NOT NULL AFTER `id`;
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_3` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;
