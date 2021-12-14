import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import CustomersLogic from '../logic/customers';
import Helper from './_helper';
import models from '../models';

const { request } = Helper;

describe('Import tests', () => {
  let supplier: Supplier;
  let transportAgent: TransportAgent;

  before(async () => {
    supplier = await Helper.createSupplier(true, {
      number: '199',
    });
    transportAgent = await Helper.createTransportAgent();
  });

  it('Should import and do the neccesary actions with the received data', async () => {
    const spy = sinon.stub(CustomersLogic, 'geocode').callsFake(() => Promise.resolve({
      coordinates: {
        type: 'Point',
        coordinates: [1, 0],
      },
    }));

    let res = await request
      .post('/api/import')
      .send({
        "Lieferanten_ID": "199",
        "ID_Tour": "11",
        "Tour_Name": "Tour 01 Gelb",
        "LieferDatum": "06.12.2021",
        "Abfahrt": "Morgens",
        "erstelltAm": "06.12.2021 08:54:52",
        "Kontakte": [
          {
            "ID_Kontakte": "2314",
            "Firma": "Ley Automobile",
            "PLZ": "79618",
            "Ort": "Rheinfelden",
            "Strasse": "Schaffmatt 1",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00",
          },
          {
            "ID_Kontakte": "2321",
            "Firma": "Amthor",
            "PLZ": "79664",
            "Ort": "Wehr",
            "Strasse": "Öflingerstr. 123",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          }
        ],
        "Versender": [
          {
            "ID_Versender": "2",
            "Name_Versender": "Kestenholz"
          },
          {
            "ID_Versender": "3",
            "Name_Versender": "Maertin GmbH"
          },
          {
            "ID_Versender": "1",
            "Name_Versender": "Schmolck"
          },
          {
            "ID_Versender": "17",
            "Name_Versender": "Schmolck02"
          },
          {
            "ID_Versender": "18",
            "Name_Versender": "Schmolck03"
          },
          {
            "ID_Versender": "19",
            "Name_Versender": "Schmolck04"
          }
        ],
        "Lieferungen": [
          {
            "tbl_Lieferung.ID_Lieferung": "94799",
            "Lieferscheinnummer": "466738",
            "Packstuecke": "1",
            "FRD_ID_Versender": "3",
            "FRD_ID_Kontakte": "2314",
            "erstelltAm": "05.12.2021 18:00:00",
          },
          {
            "tbl_Lieferung.ID_Lieferung": "94807",
            "Lieferscheinnummer": "P-354085",
            "Packstuecke": "1",
            "FRD_ID_Versender": "1",
            "FRD_ID_Kontakte": "2321",
            "erstelltAm": "05.12.2021 18:00:00"
          }
        ]
      });

    expect(res.status).equal(200);
    expect(res.body.pathway.length).equal(2);
    expect(res.body.pathway[0].Orders.length).equal(1);
    expect(res.body.pathway[1].Orders.length).equal(1);

    const tour = await models.Tours.findOne({
      where: {
        id: res.body.tour_id,
      },
      raw: true,
    });
    expect(tour.number).equal('11');

    const customerOne = await models.Customers.findOne({
      where: { number: '2314' },
      raw: true,
    });
    expect([
      res.body.pathway[1].id, res.body.pathway[0].id
    ].includes(customerOne.id)).equal(true);
    expect(customerOne.coordinates).eql({
      type: 'Point',
      coordinates: [1, 0],
    });

    const customerTwo = await models.Customers.findOne({
      where: { number: '2321' },
      raw: true,
    });
    expect([
      res.body.pathway[1].id, res.body.pathway[0].id
    ].includes(customerTwo.id)).equal(true);
    expect(customerTwo.coordinates).eql({
      type: 'Point',
      coordinates: [1, 0],
    });

    res = await request
      .post('/api/import')
      .send({
        "Lieferanten_ID": "199",
        "ID_Tour": "11",
        "Tour_Name": "Tour 01 Gelb",
        "LieferDatum": "06.12.2021",
        "Abfahrt": "Morgens",
        "erstelltAm": "06.12.2021 08:54:52",
        "Kontakte": [
          {
            "ID_Kontakte": "2314",
            "Firma": "Ley Automobile",
            "PLZ": "79618",
            "Ort": "Rheinfelden",
            "Strasse": "Schaffmatt 1",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00",
          },
          {
            "ID_Kontakte": "2321",
            "Firma": "Amthor",
            "PLZ": "79664",
            "Ort": "Wehr",
            "Strasse": "Öflingerstr. 123",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          }
        ],
        "Versender": [
          {
            "ID_Versender": "2",
            "Name_Versender": "Kestenholz"
          },
          {
            "ID_Versender": "3",
            "Name_Versender": "Maertin GmbH"
          },
          {
            "ID_Versender": "1",
            "Name_Versender": "Schmolck"
          },
          {
            "ID_Versender": "17",
            "Name_Versender": "Schmolck02"
          },
          {
            "ID_Versender": "18",
            "Name_Versender": "Schmolck03"
          },
          {
            "ID_Versender": "19",
            "Name_Versender": "Schmolck04"
          }
        ],
        "Lieferungen": [
          {
            "tbl_Lieferung.ID_Lieferung": "94799",
            "Lieferscheinnummer": "466738",
            "Packstuecke": "1",
            "FRD_ID_Versender": "3",
            "FRD_ID_Kontakte": "2314",
            "erstelltAm": "05.12.2021 18:00:00",
          },
          {
            "tbl_Lieferung.ID_Lieferung": "94807",
            "Lieferscheinnummer": "P-354085",
            "Packstuecke": "1",
            "FRD_ID_Versender": "1",
            "FRD_ID_Kontakte": "2321",
            "erstelltAm": "05.12.2021 18:00:00"
          }
        ]
      });

    expect(res.status).equal(200);
    expect(res.body.tour_id).equal(tour.id);
    expect([
      res.body.pathway[1].id, res.body.pathway[0].id
    ].includes(customerOne.id)).equal(true);
    expect([
      res.body.pathway[1].id, res.body.pathway[0].id
    ].includes(customerTwo.id)).equal(true);

    expect(spy.callCount).equal(2);
    spy.restore();
  });
});
