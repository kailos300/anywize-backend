export default function(sequelize, DataTypes) {
  const Customers = sequelize.define('Customers', {
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tour_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tour_position: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    alias: {
      type: DataTypes.STRING,
    },
    street: {
      type: DataTypes.STRING,
    },
    street_number: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    zipcode: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    sms_notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
    },
  }, {
    timestamps: false,
    tableName: 'customers',
    underscored: true,
  });


  Customers.associate = (models: any) => {
    Customers.belongsTo(models.Suppliers, { foreignKey: 'supplier_id' });
    Customers.belongsTo(models.Tours, { foreignKey: 'tour_id' });
  };

  return Customers;
}
