export default function(sequelize, DataTypes) {
  const Orders = sequelize.define('Orders', {
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    number: {
      type: DataTypes.STRING,
    },
  }, {
    timestamps: false,
    tableName: 'orders',
    underscored: true,
  });


  Orders.associate = (models: any) => {
    Orders.belongsTo(models.Customers, { foreignKey: 'customer_id' });
  };

  return Orders;
}
