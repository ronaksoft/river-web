/* eslint-disable */
// source: users.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {missingRequire} reports error on implicit type usages.
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!
/* eslint-disable */
// @ts-nocheck

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

var core_types_pb = require('./core.types_pb.js');
goog.object.extend(proto, core_types_pb);
goog.exportSymbol('proto.msg.UsersGet', null, global);
goog.exportSymbol('proto.msg.UsersGetFull', null, global);
goog.exportSymbol('proto.msg.UsersMany', null, global);
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
proto.msg.UsersGet = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.msg.UsersGet.repeatedFields_, null);
};
goog.inherits(proto.msg.UsersGet, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.msg.UsersGet.displayName = 'proto.msg.UsersGet';
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
proto.msg.UsersGetFull = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.msg.UsersGetFull.repeatedFields_, null);
};
goog.inherits(proto.msg.UsersGetFull, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.msg.UsersGetFull.displayName = 'proto.msg.UsersGetFull';
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
proto.msg.UsersMany = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.msg.UsersMany.repeatedFields_, null);
};
goog.inherits(proto.msg.UsersMany, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.msg.UsersMany.displayName = 'proto.msg.UsersMany';
}

/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.msg.UsersGet.repeatedFields_ = [1];



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
proto.msg.UsersGet.prototype.toObject = function(opt_includeInstance) {
  return proto.msg.UsersGet.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.msg.UsersGet} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.UsersGet.toObject = function(includeInstance, msg) {
  var f, obj = {
    usersList: jspb.Message.toObjectList(msg.getUsersList(),
    core_types_pb.InputUser.toObject, includeInstance)
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
 * @return {!proto.msg.UsersGet}
 */
proto.msg.UsersGet.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.msg.UsersGet;
  return proto.msg.UsersGet.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.msg.UsersGet} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.msg.UsersGet}
 */
proto.msg.UsersGet.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new core_types_pb.InputUser;
      reader.readMessage(value,core_types_pb.InputUser.deserializeBinaryFromReader);
      msg.addUsers(value);
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
proto.msg.UsersGet.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.msg.UsersGet.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.msg.UsersGet} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.UsersGet.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUsersList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      core_types_pb.InputUser.serializeBinaryToWriter
    );
  }
};


/**
 * repeated InputUser Users = 1;
 * @return {!Array<!proto.msg.InputUser>}
 */
proto.msg.UsersGet.prototype.getUsersList = function() {
  return /** @type{!Array<!proto.msg.InputUser>} */ (
    jspb.Message.getRepeatedWrapperField(this, core_types_pb.InputUser, 1));
};


/**
 * @param {!Array<!proto.msg.InputUser>} value
 * @return {!proto.msg.UsersGet} returns this
*/
proto.msg.UsersGet.prototype.setUsersList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.msg.InputUser=} opt_value
 * @param {number=} opt_index
 * @return {!proto.msg.InputUser}
 */
proto.msg.UsersGet.prototype.addUsers = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.msg.InputUser, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.msg.UsersGet} returns this
 */
proto.msg.UsersGet.prototype.clearUsersList = function() {
  return this.setUsersList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.msg.UsersGetFull.repeatedFields_ = [1];



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
proto.msg.UsersGetFull.prototype.toObject = function(opt_includeInstance) {
  return proto.msg.UsersGetFull.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.msg.UsersGetFull} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.UsersGetFull.toObject = function(includeInstance, msg) {
  var f, obj = {
    usersList: jspb.Message.toObjectList(msg.getUsersList(),
    core_types_pb.InputUser.toObject, includeInstance)
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
 * @return {!proto.msg.UsersGetFull}
 */
proto.msg.UsersGetFull.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.msg.UsersGetFull;
  return proto.msg.UsersGetFull.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.msg.UsersGetFull} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.msg.UsersGetFull}
 */
proto.msg.UsersGetFull.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new core_types_pb.InputUser;
      reader.readMessage(value,core_types_pb.InputUser.deserializeBinaryFromReader);
      msg.addUsers(value);
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
proto.msg.UsersGetFull.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.msg.UsersGetFull.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.msg.UsersGetFull} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.UsersGetFull.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUsersList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      core_types_pb.InputUser.serializeBinaryToWriter
    );
  }
};


/**
 * repeated InputUser Users = 1;
 * @return {!Array<!proto.msg.InputUser>}
 */
proto.msg.UsersGetFull.prototype.getUsersList = function() {
  return /** @type{!Array<!proto.msg.InputUser>} */ (
    jspb.Message.getRepeatedWrapperField(this, core_types_pb.InputUser, 1));
};


/**
 * @param {!Array<!proto.msg.InputUser>} value
 * @return {!proto.msg.UsersGetFull} returns this
*/
proto.msg.UsersGetFull.prototype.setUsersList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.msg.InputUser=} opt_value
 * @param {number=} opt_index
 * @return {!proto.msg.InputUser}
 */
proto.msg.UsersGetFull.prototype.addUsers = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.msg.InputUser, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.msg.UsersGetFull} returns this
 */
proto.msg.UsersGetFull.prototype.clearUsersList = function() {
  return this.setUsersList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.msg.UsersMany.repeatedFields_ = [1];



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
proto.msg.UsersMany.prototype.toObject = function(opt_includeInstance) {
  return proto.msg.UsersMany.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.msg.UsersMany} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.UsersMany.toObject = function(includeInstance, msg) {
  var f, obj = {
    usersList: jspb.Message.toObjectList(msg.getUsersList(),
    core_types_pb.User.toObject, includeInstance),
    empty: jspb.Message.getBooleanFieldWithDefault(msg, 5, false)
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
 * @return {!proto.msg.UsersMany}
 */
proto.msg.UsersMany.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.msg.UsersMany;
  return proto.msg.UsersMany.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.msg.UsersMany} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.msg.UsersMany}
 */
proto.msg.UsersMany.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new core_types_pb.User;
      reader.readMessage(value,core_types_pb.User.deserializeBinaryFromReader);
      msg.addUsers(value);
      break;
    case 5:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEmpty(value);
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
proto.msg.UsersMany.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.msg.UsersMany.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.msg.UsersMany} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.UsersMany.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUsersList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      core_types_pb.User.serializeBinaryToWriter
    );
  }
  f = message.getEmpty();
  if (f) {
    writer.writeBool(
      5,
      f
    );
  }
};


/**
 * repeated User Users = 1;
 * @return {!Array<!proto.msg.User>}
 */
proto.msg.UsersMany.prototype.getUsersList = function() {
  return /** @type{!Array<!proto.msg.User>} */ (
    jspb.Message.getRepeatedWrapperField(this, core_types_pb.User, 1));
};


/**
 * @param {!Array<!proto.msg.User>} value
 * @return {!proto.msg.UsersMany} returns this
*/
proto.msg.UsersMany.prototype.setUsersList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.msg.User=} opt_value
 * @param {number=} opt_index
 * @return {!proto.msg.User}
 */
proto.msg.UsersMany.prototype.addUsers = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.msg.User, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.msg.UsersMany} returns this
 */
proto.msg.UsersMany.prototype.clearUsersList = function() {
  return this.setUsersList([]);
};


/**
 * optional bool Empty = 5;
 * @return {boolean}
 */
proto.msg.UsersMany.prototype.getEmpty = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 5, false));
};


/**
 * @param {boolean} value
 * @return {!proto.msg.UsersMany} returns this
 */
proto.msg.UsersMany.prototype.setEmpty = function(value) {
  return jspb.Message.setProto3BooleanField(this, 5, value);
};


goog.object.extend(exports, proto.msg);
