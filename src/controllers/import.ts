import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import models from '../models';
import RoutesLogic from '../logic/routes';
import CustomersLogic from '../logic/customers';

export default {
  import: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body }: { body: ImportBody } = req;

      if (!body.Lieferungen || !body.Lieferungen.length) {
        return res.send({ status: 1, uuid: 'OMITTED_NO_ORDERS' });
      }

      const supplier = await models.Suppliers.findOne({
        where: {
          number: body.Lieferanten_ID.trim(),
        },
        raw: true,
      });

      if (!supplier) {
        throw createError(400, 'SUPPLIER_NOT_FOUND');
      }

      const ta = await models.TransportAgents.findOne();

      const [tour] = await models.Tours.findOrCreate({
        where: {
          number: body.ID_Tour.trim(),
          supplier_id: supplier.id,
        },
        defaults: {
          supplier_id: supplier.id,
          transport_agent_id: ta.id,
          number: body.ID_Tour.trim(),
          name: body.Tour_Name,
          description: 'Imported tour',
        },
      });

      const customers: Customer[] = await Promise.all(
        body.Kontakte.map((c) => {
          return models.Customers.findOrCreate({
            where: {
              number: c.ID_Kontakte.trim(),
              tour_id: tour.id,
            },
            defaults: {
              supplier_id: supplier.id,
              tour_id: tour.id,
              tour_position: c.Prioritaet,
              number: c.ID_Kontakte.trim(),
              name: c.Firma,
              alias: c.Firma,
              street: c.Strasse,
              street_number: c.Hausnummer,
              city: c.Ort,
              zipcode: c.PLZ,
              country: 'DE',
            }
          }).then(([customer, isNew]) => {
            if (!isNew) {
              return customer.update({
                tour_position: c.Prioritaet,
                number: c.ID_Kontakte.trim(),
                name: c.Firma,
                alias: c.Firma,
                street: c.Strasse,
                street_number: c.Hausnummer,
                city: c.Ort,
                zipcode: c.PLZ,
              }).then((c) => c.toJSON());
            }

            return CustomersLogic.geocode(`${customer.street} ${customer.street_number}, ${customer.city}, Germany`)
              .then((res) => {
                if (!res) {
                  return customer.toJSON();
                }

                return customer.update({ ...res })
                  .then((c) => c.toJSON());
              })
          });
        }),
      );

      const orders: Order[] = await Promise.all(
        body.Lieferungen.map((o) => {
          const customer = customers.find((c) => c.number === o.FRD_ID_Kontakte);

          if (!customer) {
            return Promise.resolve();
          }

          return models.Orders.create({
            supplier_id: supplier.id,
            customer_id: customer.id,
            description: 'Importierter Auftrag',
            number: o['tbl_Lieferung.ID_Lieferung'],
          }).then((o) => o.toJSON());
        })
      );

      try {
        const route = await RoutesLogic.create({
          order_ids: orders.map((o) => o.id),
          tour_id: tour.id,
        }, {
          supplier_id: supplier.id
        } as User);

        return res.send(route);
      } catch (err) {
        await models.Orders.destroy({
          where: {
            id: orders.map((o) => o.id),
          },
        });

        throw err;
      }
    } catch (err) {
      return next(err);
    }
  },
};
