
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('cards', function(table) {
      table.increments('id').primary();
      table.string('front_text');
      table.string('back_text');
      table.string('card_header');
      table.boolean('memorized');
      table.integer('user_id');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('cards'),
  ]);
};
