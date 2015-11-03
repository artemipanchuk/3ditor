#### ———————————————————————————————————————
##   DB Controller
#### Provides database interface
#### ———————————————————————————————————————

MongoDB = require 'mongodb'

db = do ->
	{Server, Db} = MongoDB

	server   = new Server '127.0.0.1', 27017, {auto_reconnect: true, poolSize: 4}
	database = new Db 'primary', server, {safe: true, w: 0, native_parser: false}

	return database

connection = null

db.open (error, current) ->
	if error
		log 'DB: Unknown database' ; return

	connection = current

#### ———————————————————————————————————————

class DB
	within: (collection, callback) ->
		connection.collection collection, (error, collection) ->
			if error
				log 'DB: Unknown collection' ; return

			collection.find {}, {}, (error, cursor) ->
				cursor.toArray (error, items) ->
					callback items

	insert: (collection, object) ->
		connection.collection collection, (error, collection) ->
			if error
				log 'DB: Unknown collection' ; return

			collection.insert object

	update: (collection, query, object) ->
		connection.collection collection, (error, collection) ->
			if error
				log 'DB: Unknown collection' ; return

			collection.update query, object

	remove: (collection, object) ->
		connection.collection collection, (error, collection) ->
			collection.remove object

#### ———————————————————————————————————————