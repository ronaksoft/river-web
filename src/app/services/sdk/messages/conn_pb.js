/* eslint-disable */
// source: conn.proto
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

var core_types_pb = require('./core.types_pb.js');
goog.object.extend(proto, core_types_pb);
goog.exportSymbol('proto.msg.PublicKey', null, global);
goog.exportSymbol('proto.msg.RiverConnection', null, global);
goog.exportSymbol('proto.msg.ServerKeys', null, global);
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
proto.msg.PublicKey = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.msg.PublicKey, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.msg.PublicKey.displayName = 'proto.msg.PublicKey';
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
proto.msg.ServerKeys = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.msg.ServerKeys.repeatedFields_, null);
};
goog.inherits(proto.msg.ServerKeys, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.msg.ServerKeys.displayName = 'proto.msg.ServerKeys';
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
proto.msg.RiverConnection = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.msg.RiverConnection, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.msg.RiverConnection.displayName = 'proto.msg.RiverConnection';
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
proto.msg.PublicKey.prototype.toObject = function(opt_includeInstance) {
  return proto.msg.PublicKey.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.msg.PublicKey} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.PublicKey.toObject = function(includeInstance, msg) {
  var f, obj = {
    n: jspb.Message.getFieldWithDefault(msg, 1, ""),
    fingerprint: jspb.Message.getFieldWithDefault(msg, 2, "0"),
    e: jspb.Message.getFieldWithDefault(msg, 3, 0)
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
 * @return {!proto.msg.PublicKey}
 */
proto.msg.PublicKey.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.msg.PublicKey;
  return proto.msg.PublicKey.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.msg.PublicKey} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.msg.PublicKey}
 */
proto.msg.PublicKey.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setN(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setFingerprint(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setE(value);
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
proto.msg.PublicKey.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.msg.PublicKey.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.msg.PublicKey} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.PublicKey.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getN();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getFingerprint();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      2,
      f
    );
  }
  f = message.getE();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
};


/**
 * optional string N = 1;
 * @return {string}
 */
proto.msg.PublicKey.prototype.getN = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.msg.PublicKey} returns this
 */
proto.msg.PublicKey.prototype.setN = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional int64 FingerPrint = 2;
 * @return {string}
 */
proto.msg.PublicKey.prototype.getFingerprint = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/**
 * @param {string} value
 * @return {!proto.msg.PublicKey} returns this
 */
proto.msg.PublicKey.prototype.setFingerprint = function(value) {
  return jspb.Message.setProto3StringIntField(this, 2, value);
};


/**
 * optional uint32 E = 3;
 * @return {number}
 */
proto.msg.PublicKey.prototype.getE = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.msg.PublicKey} returns this
 */
proto.msg.PublicKey.prototype.setE = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.msg.ServerKeys.repeatedFields_ = [1,2];



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
proto.msg.ServerKeys.prototype.toObject = function(opt_includeInstance) {
  return proto.msg.ServerKeys.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.msg.ServerKeys} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.ServerKeys.toObject = function(includeInstance, msg) {
  var f, obj = {
    publickeysList: jspb.Message.toObjectList(msg.getPublickeysList(),
    proto.msg.PublicKey.toObject, includeInstance),
    dhgroupsList: jspb.Message.toObjectList(msg.getDhgroupsList(),
    core_types_pb.DHGroup.toObject, includeInstance)
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
 * @return {!proto.msg.ServerKeys}
 */
proto.msg.ServerKeys.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.msg.ServerKeys;
  return proto.msg.ServerKeys.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.msg.ServerKeys} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.msg.ServerKeys}
 */
proto.msg.ServerKeys.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.msg.PublicKey;
      reader.readMessage(value,proto.msg.PublicKey.deserializeBinaryFromReader);
      msg.addPublickeys(value);
      break;
    case 2:
      var value = new core_types_pb.DHGroup;
      reader.readMessage(value,core_types_pb.DHGroup.deserializeBinaryFromReader);
      msg.addDhgroups(value);
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
proto.msg.ServerKeys.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.msg.ServerKeys.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.msg.ServerKeys} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.ServerKeys.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPublickeysList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.msg.PublicKey.serializeBinaryToWriter
    );
  }
  f = message.getDhgroupsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      core_types_pb.DHGroup.serializeBinaryToWriter
    );
  }
};


/**
 * repeated PublicKey PublicKeys = 1;
 * @return {!Array<!proto.msg.PublicKey>}
 */
proto.msg.ServerKeys.prototype.getPublickeysList = function() {
  return /** @type{!Array<!proto.msg.PublicKey>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.msg.PublicKey, 1));
};


/**
 * @param {!Array<!proto.msg.PublicKey>} value
 * @return {!proto.msg.ServerKeys} returns this
*/
proto.msg.ServerKeys.prototype.setPublickeysList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.msg.PublicKey=} opt_value
 * @param {number=} opt_index
 * @return {!proto.msg.PublicKey}
 */
proto.msg.ServerKeys.prototype.addPublickeys = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.msg.PublicKey, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.msg.ServerKeys} returns this
 */
proto.msg.ServerKeys.prototype.clearPublickeysList = function() {
  return this.setPublickeysList([]);
};


/**
 * repeated DHGroup DHGroups = 2;
 * @return {!Array<!proto.msg.DHGroup>}
 */
proto.msg.ServerKeys.prototype.getDhgroupsList = function() {
  return /** @type{!Array<!proto.msg.DHGroup>} */ (
    jspb.Message.getRepeatedWrapperField(this, core_types_pb.DHGroup, 2));
};


/**
 * @param {!Array<!proto.msg.DHGroup>} value
 * @return {!proto.msg.ServerKeys} returns this
*/
proto.msg.ServerKeys.prototype.setDhgroupsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.msg.DHGroup=} opt_value
 * @param {number=} opt_index
 * @return {!proto.msg.DHGroup}
 */
proto.msg.ServerKeys.prototype.addDhgroups = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.msg.DHGroup, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.msg.ServerKeys} returns this
 */
proto.msg.ServerKeys.prototype.clearDhgroupsList = function() {
  return this.setDhgroupsList([]);
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
proto.msg.RiverConnection.prototype.toObject = function(opt_includeInstance) {
  return proto.msg.RiverConnection.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.msg.RiverConnection} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.RiverConnection.toObject = function(includeInstance, msg) {
  var f, obj = {
    authid: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    authkey: msg.getAuthkey_asB64(),
    userid: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    username: jspb.Message.getFieldWithDefault(msg, 4, ""),
    phone: jspb.Message.getFieldWithDefault(msg, 5, ""),
    firstname: jspb.Message.getFieldWithDefault(msg, 6, ""),
    lastname: jspb.Message.getFieldWithDefault(msg, 7, ""),
    difftime: jspb.Message.getFieldWithDefault(msg, 8, 0)
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
 * @return {!proto.msg.RiverConnection}
 */
proto.msg.RiverConnection.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.msg.RiverConnection;
  return proto.msg.RiverConnection.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.msg.RiverConnection} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.msg.RiverConnection}
 */
proto.msg.RiverConnection.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setAuthid(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setAuthkey(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setUserid(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setUsername(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setPhone(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setFirstname(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setLastname(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setDifftime(value);
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
proto.msg.RiverConnection.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.msg.RiverConnection.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.msg.RiverConnection} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.RiverConnection.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAuthid();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      1,
      f
    );
  }
  f = message.getAuthkey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getUserid();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      3,
      f
    );
  }
  f = message.getUsername();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getPhone();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getFirstname();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getLastname();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getDifftime();
  if (f !== 0) {
    writer.writeInt64(
      8,
      f
    );
  }
};


/**
 * optional int64 AuthID = 1;
 * @return {string}
 */
proto.msg.RiverConnection.prototype.getAuthid = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/**
 * @param {string} value
 * @return {!proto.msg.RiverConnection} returns this
 */
proto.msg.RiverConnection.prototype.setAuthid = function(value) {
  return jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional bytes AuthKey = 2;
 * @return {!(string|Uint8Array)}
 */
proto.msg.RiverConnection.prototype.getAuthkey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes AuthKey = 2;
 * This is a type-conversion wrapper around `getAuthkey()`
 * @return {string}
 */
proto.msg.RiverConnection.prototype.getAuthkey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getAuthkey()));
};


/**
 * optional bytes AuthKey = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAuthkey()`
 * @return {!Uint8Array}
 */
proto.msg.RiverConnection.prototype.getAuthkey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getAuthkey()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.msg.RiverConnection} returns this
 */
proto.msg.RiverConnection.prototype.setAuthkey = function(value) {
  return jspb.Message.setProto3BytesField(this, 2, value);
};


/**
 * optional int64 UserID = 3;
 * @return {string}
 */
proto.msg.RiverConnection.prototype.getUserid = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/**
 * @param {string} value
 * @return {!proto.msg.RiverConnection} returns this
 */
proto.msg.RiverConnection.prototype.setUserid = function(value) {
  return jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional string Username = 4;
 * @return {string}
 */
proto.msg.RiverConnection.prototype.getUsername = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.msg.RiverConnection} returns this
 */
proto.msg.RiverConnection.prototype.setUsername = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string Phone = 5;
 * @return {string}
 */
proto.msg.RiverConnection.prototype.getPhone = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.msg.RiverConnection} returns this
 */
proto.msg.RiverConnection.prototype.setPhone = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional string FirstName = 6;
 * @return {string}
 */
proto.msg.RiverConnection.prototype.getFirstname = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * @param {string} value
 * @return {!proto.msg.RiverConnection} returns this
 */
proto.msg.RiverConnection.prototype.setFirstname = function(value) {
  return jspb.Message.setProto3StringField(this, 6, value);
};


/**
 * optional string LastName = 7;
 * @return {string}
 */
proto.msg.RiverConnection.prototype.getLastname = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * @param {string} value
 * @return {!proto.msg.RiverConnection} returns this
 */
proto.msg.RiverConnection.prototype.setLastname = function(value) {
  return jspb.Message.setProto3StringField(this, 7, value);
};


/**
 * optional int64 DiffTime = 8;
 * @return {number}
 */
proto.msg.RiverConnection.prototype.getDifftime = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/**
 * @param {number} value
 * @return {!proto.msg.RiverConnection} returns this
 */
proto.msg.RiverConnection.prototype.setDifftime = function(value) {
  return jspb.Message.setProto3IntField(this, 8, value);
};


goog.object.extend(exports, proto.msg);
