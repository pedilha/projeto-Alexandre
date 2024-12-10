// models/Book.js
const { DataTypes } = require("sequelize");
const sequelize = require('../config/database');


const Book = sequelize.define("Book", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalPages: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  currentPage: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Book;
