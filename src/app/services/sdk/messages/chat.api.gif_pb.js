/* eslint-disable */
// source: chat.api.gif.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

var chat_core_message_medias_pb = require('./chat.core.message.medias_pb.js');
goog.object.extend(proto, chat_core_message_medias_pb);
var chat_core_types_pb = require('./chat.core.types_pb.js');
goog.object.extend(proto, chat_core_types_pb);
goog.exportSymbol('proto.msg.FoundGif', null, global);
goog.exportSymbol('proto.msg.FoundGifs', null, global);
goog.exportSymbol('proto.msg.GifGetSaved', null, global);
goog.exportSymbol('proto.msg.GifSave', null, global);
goog.exportSymbol('proto.msg.GifSearch', null, global);
goog.exportSymbol('proto.msg.SavedGifs', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.msg.GifGetSaved = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.msg.GifGetSaved, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.msg.GifGetSaved.displayName = 'proto.msg.GifGetSaved';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.msg.GifSave = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.msg.GifSave, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.msg.GifSave.displayName = 'proto.msg.GifSave';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.msg.GifSearch = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.msg.GifSearch, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.msg.GifSearch.displayName = 'proto.msg.GifSearch';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.msg.FoundGifs = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.msg.FoundGifs.repeatedFields_, null);
};
goog.inherits(proto.msg.FoundGifs, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.msg.FoundGifs.displayName = 'proto.msg.FoundGifs';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.msg.FoundGif = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.msg.FoundGif, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.msg.FoundGif.displayName = 'proto.msg.FoundGif';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.msg.SavedGifs = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.msg.SavedGifs.repeatedFields_, null);
};
goog.inherits(proto.msg.SavedGifs, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.msg.SavedGifs.displayName = 'proto.msg.SavedGifs';
}



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.msg.GifGetSaved.prototype.toObject = function(opt_includeInstance) {
  return proto.msg.GifGetSaved.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.msg.GifGetSaved} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.GifGetSaved.toObject = function(includeInstance, msg) {
  var f, obj = {
    hash: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.msg.GifGetSaved}
 */
proto.msg.GifGetSaved.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.msg.GifGetSaved;
  return proto.msg.GifGetSaved.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.msg.GifGetSaved} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.msg.GifGetSaved}
 */
proto.msg.GifGetSaved.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readFixed32());
      msg.setHash(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.msg.GifGetSaved.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.msg.GifGetSaved.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.msg.GifGetSaved} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.GifGetSaved.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {number} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeFixed32(
      1,
      f
    );
  }
};


/**
 * required fixed32 Hash = 1;
 * @return {number}
 */
proto.msg.GifGetSaved.prototype.getHash = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.msg.GifGetSaved} returns this
 */
proto.msg.GifGetSaved.prototype.setHash = function(value) {
  return jspb.Message.setField(this, 1, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.msg.GifGetSaved} returns this
 */
proto.msg.GifGetSaved.prototype.clearHash = function() {
  return jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.msg.GifGetSaved.prototype.hasHash = function() {
  return jspb.Message.getField(this, 1) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.msg.GifSave.prototype.toObject = function(opt_includeInstance) {
  return proto.msg.GifSave.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.msg.GifSave} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.GifSave.toObject = function(includeInstance, msg) {
  var f, obj = {
    doc: (f = msg.getDoc()) && chat_core_types_pb.InputDocument.toObject(includeInstance, f),
    unsave: (f = jspb.Message.getBooleanField(msg, 2)) == null ? undefined : f
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.msg.GifSave}
 */
proto.msg.GifSave.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.msg.GifSave;
  return proto.msg.GifSave.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.msg.GifSave} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.msg.GifSave}
 */
proto.msg.GifSave.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new chat_core_types_pb.InputDocument;
      reader.readMessage(value,chat_core_types_pb.InputDocument.deserializeBinaryFromReader);
      msg.setDoc(value);
      break;
    case 2:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setUnsave(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.msg.GifSave.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.msg.GifSave.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.msg.GifSave} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.GifSave.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDoc();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      chat_core_types_pb.InputDocument.serializeBinaryToWriter
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeBool(
      2,
      f
    );
  }
};


/**
 * required InputDocument Doc = 1;
 * @return {!proto.msg.InputDocument}
 */
proto.msg.GifSave.prototype.getDoc = function() {
  return /** @type{!proto.msg.InputDocument} */ (
    jspb.Message.getWrapperField(this, chat_core_types_pb.InputDocument, 1, 1));
};


/**
 * @param {!proto.msg.InputDocument} value
 * @return {!proto.msg.GifSave} returns this
*/
proto.msg.GifSave.prototype.setDoc = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.msg.GifSave} returns this
 */
proto.msg.GifSave.prototype.clearDoc = function() {
  return jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.msg.GifSave.prototype.hasDoc = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * required bool UnSave = 2;
 * @return {boolean}
 */
proto.msg.GifSave.prototype.getUnsave = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 2, false));
};


/**
 * @param {boolean} value
 * @return {!proto.msg.GifSave} returns this
 */
proto.msg.GifSave.prototype.setUnsave = function(value) {
  return jspb.Message.setField(this, 2, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.msg.GifSave} returns this
 */
proto.msg.GifSave.prototype.clearUnsave = function() {
  return jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.msg.GifSave.prototype.hasUnsave = function() {
  return jspb.Message.getField(this, 2) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.msg.GifSearch.prototype.toObject = function(opt_includeInstance) {
  return proto.msg.GifSearch.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.msg.GifSearch} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.GifSearch.toObject = function(includeInstance, msg) {
  var f, obj = {
    query: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
    hash: (f = jspb.Message.getField(msg, 2)) == null ? undefined : f
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.msg.GifSearch}
 */
proto.msg.GifSearch.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.msg.GifSearch;
  return proto.msg.GifSearch.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.msg.GifSearch} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.msg.GifSearch}
 */
proto.msg.GifSearch.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setQuery(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setHash(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.msg.GifSearch.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.msg.GifSearch.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.msg.GifSearch} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.GifSearch.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {string} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeString(
      1,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeInt64(
      2,
      f
    );
  }
};


/**
 * required string Query = 1;
 * @return {string}
 */
proto.msg.GifSearch.prototype.getQuery = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.msg.GifSearch} returns this
 */
proto.msg.GifSearch.prototype.setQuery = function(value) {
  return jspb.Message.setField(this, 1, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.msg.GifSearch} returns this
 */
proto.msg.GifSearch.prototype.clearQuery = function() {
  return jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.msg.GifSearch.prototype.hasQuery = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * required int64 Hash = 2;
 * @return {number}
 */
proto.msg.GifSearch.prototype.getHash = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.msg.GifSearch} returns this
 */
proto.msg.GifSearch.prototype.setHash = function(value) {
  return jspb.Message.setField(this, 2, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.msg.GifSearch} returns this
 */
proto.msg.GifSearch.prototype.clearHash = function() {
  return jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.msg.GifSearch.prototype.hasHash = function() {
  return jspb.Message.getField(this, 2) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.msg.FoundGifs.repeatedFields_ = [2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.msg.FoundGifs.prototype.toObject = function(opt_includeInstance) {
  return proto.msg.FoundGifs.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.msg.FoundGifs} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.FoundGifs.toObject = function(includeInstance, msg) {
  var f, obj = {
    nextoffset: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
    gifsList: jspb.Message.toObjectList(msg.getGifsList(),
    proto.msg.FoundGif.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.msg.FoundGifs}
 */
proto.msg.FoundGifs.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.msg.FoundGifs;
  return proto.msg.FoundGifs.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.msg.FoundGifs} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.msg.FoundGifs}
 */
proto.msg.FoundGifs.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setNextoffset(value);
      break;
    case 2:
      var value = new proto.msg.FoundGif;
      reader.readMessage(value,proto.msg.FoundGif.deserializeBinaryFromReader);
      msg.addGifs(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.msg.FoundGifs.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.msg.FoundGifs.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.msg.FoundGifs} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.FoundGifs.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {number} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeInt32(
      1,
      f
    );
  }
  f = message.getGifsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.msg.FoundGif.serializeBinaryToWriter
    );
  }
};


/**
 * required int32 NextOffset = 1;
 * @return {number}
 */
proto.msg.FoundGifs.prototype.getNextoffset = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.msg.FoundGifs} returns this
 */
proto.msg.FoundGifs.prototype.setNextoffset = function(value) {
  return jspb.Message.setField(this, 1, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.msg.FoundGifs} returns this
 */
proto.msg.FoundGifs.prototype.clearNextoffset = function() {
  return jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.msg.FoundGifs.prototype.hasNextoffset = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * repeated FoundGif Gifs = 2;
 * @return {!Array<!proto.msg.FoundGif>}
 */
proto.msg.FoundGifs.prototype.getGifsList = function() {
  return /** @type{!Array<!proto.msg.FoundGif>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.msg.FoundGif, 2));
};


/**
 * @param {!Array<!proto.msg.FoundGif>} value
 * @return {!proto.msg.FoundGifs} returns this
*/
proto.msg.FoundGifs.prototype.setGifsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.msg.FoundGif=} opt_value
 * @param {number=} opt_index
 * @return {!proto.msg.FoundGif}
 */
proto.msg.FoundGifs.prototype.addGifs = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.msg.FoundGif, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.msg.FoundGifs} returns this
 */
proto.msg.FoundGifs.prototype.clearGifsList = function() {
  return this.setGifsList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.msg.FoundGif.prototype.toObject = function(opt_includeInstance) {
  return proto.msg.FoundGif.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.msg.FoundGif} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.FoundGif.toObject = function(includeInstance, msg) {
  var f, obj = {
    url: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
    doc: (f = msg.getDoc()) && chat_core_message_medias_pb.Document.toObject(includeInstance, f),
    thumb: (f = msg.getThumb()) && chat_core_message_medias_pb.Document.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.msg.FoundGif}
 */
proto.msg.FoundGif.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.msg.FoundGif;
  return proto.msg.FoundGif.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.msg.FoundGif} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.msg.FoundGif}
 */
proto.msg.FoundGif.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setUrl(value);
      break;
    case 2:
      var value = new chat_core_message_medias_pb.Document;
      reader.readMessage(value,chat_core_message_medias_pb.Document.deserializeBinaryFromReader);
      msg.setDoc(value);
      break;
    case 3:
      var value = new chat_core_message_medias_pb.Document;
      reader.readMessage(value,chat_core_message_medias_pb.Document.deserializeBinaryFromReader);
      msg.setThumb(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.msg.FoundGif.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.msg.FoundGif.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.msg.FoundGif} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.FoundGif.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {string} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getDoc();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      chat_core_message_medias_pb.Document.serializeBinaryToWriter
    );
  }
  f = message.getThumb();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      chat_core_message_medias_pb.Document.serializeBinaryToWriter
    );
  }
};


/**
 * required string Url = 1;
 * @return {string}
 */
proto.msg.FoundGif.prototype.getUrl = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.msg.FoundGif} returns this
 */
proto.msg.FoundGif.prototype.setUrl = function(value) {
  return jspb.Message.setField(this, 1, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.msg.FoundGif} returns this
 */
proto.msg.FoundGif.prototype.clearUrl = function() {
  return jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.msg.FoundGif.prototype.hasUrl = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * required Document Doc = 2;
 * @return {!proto.msg.Document}
 */
proto.msg.FoundGif.prototype.getDoc = function() {
  return /** @type{!proto.msg.Document} */ (
    jspb.Message.getWrapperField(this, chat_core_message_medias_pb.Document, 2, 1));
};


/**
 * @param {!proto.msg.Document} value
 * @return {!proto.msg.FoundGif} returns this
*/
proto.msg.FoundGif.prototype.setDoc = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.msg.FoundGif} returns this
 */
proto.msg.FoundGif.prototype.clearDoc = function() {
  return jspb.Message.setField(this, 2, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.msg.FoundGif.prototype.hasDoc = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * required Document Thumb = 3;
 * @return {!proto.msg.Document}
 */
proto.msg.FoundGif.prototype.getThumb = function() {
  return /** @type{!proto.msg.Document} */ (
    jspb.Message.getWrapperField(this, chat_core_message_medias_pb.Document, 3, 1));
};


/**
 * @param {!proto.msg.Document} value
 * @return {!proto.msg.FoundGif} returns this
*/
proto.msg.FoundGif.prototype.setThumb = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.msg.FoundGif} returns this
 */
proto.msg.FoundGif.prototype.clearThumb = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.msg.FoundGif.prototype.hasThumb = function() {
  return jspb.Message.getField(this, 3) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.msg.SavedGifs.repeatedFields_ = [2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.msg.SavedGifs.prototype.toObject = function(opt_includeInstance) {
  return proto.msg.SavedGifs.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.msg.SavedGifs} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.SavedGifs.toObject = function(includeInstance, msg) {
  var f, obj = {
    hash: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
    docsList: jspb.Message.toObjectList(msg.getDocsList(),
    chat_core_message_medias_pb.MediaDocument.toObject, includeInstance),
    notmodified: (f = jspb.Message.getBooleanField(msg, 3)) == null ? undefined : f
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.msg.SavedGifs}
 */
proto.msg.SavedGifs.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.msg.SavedGifs;
  return proto.msg.SavedGifs.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.msg.SavedGifs} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.msg.SavedGifs}
 */
proto.msg.SavedGifs.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readFixed32());
      msg.setHash(value);
      break;
    case 2:
      var value = new chat_core_message_medias_pb.MediaDocument;
      reader.readMessage(value,chat_core_message_medias_pb.MediaDocument.deserializeBinaryFromReader);
      msg.addDocs(value);
      break;
    case 3:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setNotmodified(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.msg.SavedGifs.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.msg.SavedGifs.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.msg.SavedGifs} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.SavedGifs.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = /** @type {number} */ (jspb.Message.getField(message, 1));
  if (f != null) {
    writer.writeFixed32(
      1,
      f
    );
  }
  f = message.getDocsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      chat_core_message_medias_pb.MediaDocument.serializeBinaryToWriter
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeBool(
      3,
      f
    );
  }
};


/**
 * required fixed32 Hash = 1;
 * @return {number}
 */
proto.msg.SavedGifs.prototype.getHash = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.msg.SavedGifs} returns this
 */
proto.msg.SavedGifs.prototype.setHash = function(value) {
  return jspb.Message.setField(this, 1, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.msg.SavedGifs} returns this
 */
proto.msg.SavedGifs.prototype.clearHash = function() {
  return jspb.Message.setField(this, 1, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.msg.SavedGifs.prototype.hasHash = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * repeated MediaDocument Docs = 2;
 * @return {!Array<!proto.msg.MediaDocument>}
 */
proto.msg.SavedGifs.prototype.getDocsList = function() {
  return /** @type{!Array<!proto.msg.MediaDocument>} */ (
    jspb.Message.getRepeatedWrapperField(this, chat_core_message_medias_pb.MediaDocument, 2));
};


/**
 * @param {!Array<!proto.msg.MediaDocument>} value
 * @return {!proto.msg.SavedGifs} returns this
*/
proto.msg.SavedGifs.prototype.setDocsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.msg.MediaDocument=} opt_value
 * @param {number=} opt_index
 * @return {!proto.msg.MediaDocument}
 */
proto.msg.SavedGifs.prototype.addDocs = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.msg.MediaDocument, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.msg.SavedGifs} returns this
 */
proto.msg.SavedGifs.prototype.clearDocsList = function() {
  return this.setDocsList([]);
};


/**
 * required bool NotModified = 3;
 * @return {boolean}
 */
proto.msg.SavedGifs.prototype.getNotmodified = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 3, false));
};


/**
 * @param {boolean} value
 * @return {!proto.msg.SavedGifs} returns this
 */
proto.msg.SavedGifs.prototype.setNotmodified = function(value) {
  return jspb.Message.setField(this, 3, value);
};


/**
 * Clears the field making it undefined.
 * @return {!proto.msg.SavedGifs} returns this
 */
proto.msg.SavedGifs.prototype.clearNotmodified = function() {
  return jspb.Message.setField(this, 3, undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.msg.SavedGifs.prototype.hasNotmodified = function() {
  return jspb.Message.getField(this, 3) != null;
};


goog.object.extend(exports, proto.msg);
