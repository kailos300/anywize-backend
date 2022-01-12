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

  it('Import Tour_12_Morgens bug 12-01-2022', async () => {
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
        "ID_Tour": " 12",
        "Tour_Name": "Tour 02 Rot",
        "LieferDatum": "12.01.2022",
        "Abfahrt": "Morgens",
        "erstelltAm": "12.01.2022 08:48:20",
        "Kontakte": [
          {
            "ID_Kontakte": "1858",
            "Firma": "Wursthorn Autohaus GmbH",
            "PLZ": "79199",
            "Ort": "Kirchzarten",
            "Strasse": "Wilhelm-Schauenberg-Str.",
            "Hausnummer": "1",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          },
          {
            "ID_Kontakte": "2325",
            "Firma": "Bach KFZ-Landmaschinen",
            "PLZ": "79822",
            "Ort": "Titisee-Neustadt",
            "Strasse": "Jostalstr. 26",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          },
          {
            "ID_Kontakte": "2343",
            "Firma": "Henkel Autohaus GmbH",
            "PLZ": "78199",
            "Ort": "Bräunlingen",
            "Strasse": "Kirnbergstr. 2",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          },
          {
            "ID_Kontakte": "2399",
            "Firma": "Roth Nutzfahrzeuge",
            "PLZ": "79848",
            "Ort": "Bonndorf",
            "Strasse": "Eisenbahnstr. 3",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          },
          {
            "ID_Kontakte": "2415",
            "Firma": "Reich Bosch Car Service",
            "PLZ": "79271",
            "Ort": "St. Peter",
            "Strasse": "Jörgleweg 19",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          },
          {
            "ID_Kontakte": "2418",
            "Firma": "Kult GmbH & Co. KG",
            "PLZ": "79254",
            "Ort": "Oberried",
            "Strasse": "Obertalstr. 13",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          },
          {
            "ID_Kontakte": "2487",
            "Firma": "Krissler Autohaus",
            "PLZ": "79848",
            "Ort": "Bonndorf",
            "Strasse": "Lenzkircherstr. 3",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          },
          {
            "ID_Kontakte": "2671",
            "Firma": "Anselm Winterhalter  Spedition & Omnibusverk.",
            "PLZ": "79254",
            "Ort": "Oberried",
            "Strasse": "Im Bühl",
            "Hausnummer": "25",
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
            "tbl_Lieferung.ID_Lieferung": "97425",
            "Lieferscheinnummer": "471870",
            "Packstuecke": "1",
            "FRD_ID_Versender": "3",
            "FRD_ID_Kontakte": "1858",
            "erstelltAm": "11.01.2022 08:53:54"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97427",
            "Lieferscheinnummer": "S-314655-314634-314645",
            "Packstuecke": "2",
            "FRD_ID_Versender": "18",
            "FRD_ID_Kontakte": "2415",
            "erstelltAm": "11.01.2022 09:10:37"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97440",
            "Lieferscheinnummer": "471942",
            "Packstuecke": "1",
            "FRD_ID_Versender": "3",
            "FRD_ID_Kontakte": "2487",
            "erstelltAm": "11.01.2022 10:37:56"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97444",
            "Lieferscheinnummer": "471934",
            "Packstuecke": "1",
            "FRD_ID_Versender": "3",
            "FRD_ID_Kontakte": "2325",
            "erstelltAm": "11.01.2022 10:44:56"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97445",
            "Lieferscheinnummer": "P-355161",
            "Packstuecke": "1",
            "FRD_ID_Versender": "1",
            "FRD_ID_Kontakte": "2415",
            "erstelltAm": "11.01.2022 10:53:01"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97468",
            "Lieferscheinnummer": "6805884/33146",
            "Packstuecke": "1",
            "FRD_ID_Versender": "2",
            "FRD_ID_Kontakte": "2418",
            "erstelltAm": "11.01.2022 13:08:01"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97479",
            "Lieferscheinnummer": "6805907/33356",
            "Packstuecke": "1",
            "FRD_ID_Versender": "2",
            "FRD_ID_Kontakte": "2671",
            "erstelltAm": "11.01.2022 14:07:04"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97483",
            "Lieferscheinnummer": "6805918/33146",
            "Packstuecke": "0",
            "FRD_ID_Versender": "2",
            "FRD_ID_Kontakte": "2418",
            "erstelltAm": "11.01.2022 14:13:32"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97507",
            "Lieferscheinnummer": "472019-472023,472002",
            "Packstuecke": "4",
            "FRD_ID_Versender": "3",
            "FRD_ID_Kontakte": "2343",
            "erstelltAm": "11.01.2022 15:21:40"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97580",
            "Lieferscheinnummer": "6805984/33534",
            "Packstuecke": "1",
            "FRD_ID_Versender": "2",
            "FRD_ID_Kontakte": "2399",
            "erstelltAm": "12.01.2022 08:25:57"
          }
        ],
      });

    expect(res.status).equal(200);

    expect(res.body.pathway.map((p) => p.number).sort()).eql([
      '1858',
      '2325',
      '2343',
      '2399',
      '2415',
      '2418',
      '2487',
      '2671',
    ].sort());

    const orders = await models.Orders.findAll({
      where: { route_id: res.body.id },
      attributes: ['id', 'number'],
      raw: true,
    });
    expect(orders.length).equal(10);
    expect(orders.map((o) => o.number).sort()).eql([
      '97425',
      '97427',
      '97440',
      '97444',
      '97445',
      '97468',
      '97479',
      '97483',
      '97507',
      '97580',
    ].sort());
  });
});
