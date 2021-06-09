export default function(sequelize, DataTypes) {
  const Routes = sequelize.define('Routes', {
    tour_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    route: {
      type: DataTypes.JSON,
      defaultValue: () => ([]),
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
  }, {
    timestamps: false,
    tableName: 'routes',
    underscored: true,
  });


  Routes.associate = (models: any) => {
    Routes.belongsTo(models.Customers, { foreignKey: 'tour_id' });
    Routes.hasMany(models.Orders, { foreignKey: 'route_id' });
  };

  return Routes;
}
