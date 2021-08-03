/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
// source: service.proto
/**
 * @fileoverview
 * @enhanceable
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
goog.exportSymbol('proto.msg.ServiceSendMessage', null, global);
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
proto.msg.ServiceSendMessage = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.msg.ServiceSendMessage.repeatedFields_, null);
};
goog.inherits(proto.msg.ServiceSendMessage, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.msg.ServiceSendMessage.displayName = 'proto.msg.ServiceSendMessage';
}

/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.msg.ServiceSendMessage.repeatedFields_ = [8];



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
proto.msg.ServiceSendMessage.prototype.toObject = function(opt_includeInstance) {
  return proto.msg.ServiceSendMessage.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.msg.ServiceSendMessage} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.ServiceSendMessage.toObject = function(includeInstance, msg) {
  var f, obj = {
    onbehalf: jspb.Message.getFieldWithDefault(msg, 100, 0),
    randomid: jspb.Message.getFieldWithDefault(msg, 1, 0),
    peer: (f = msg.getPeer()) && core_types_pb.InputPeer.toObject(includeInstance, f),
    body: jspb.Message.getFieldWithDefault(msg, 5, ""),
    replyto: jspb.Message.getFieldWithDefault(msg, 6, 0),
    cleardraft: jspb.Message.getBooleanFieldWithDefault(msg, 7, false),
    entitiesList: jspb.Message.toObjectList(msg.getEntitiesList(),
    core_types_pb.MessageEntity.toObject, includeInstance)
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
 * @return {!proto.msg.ServiceSendMessage}
 */
proto.msg.ServiceSendMessage.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.msg.ServiceSendMessage;
  return proto.msg.ServiceSendMessage.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.msg.ServiceSendMessage} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.msg.ServiceSendMessage}
 */
proto.msg.ServiceSendMessage.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 100:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setOnbehalf(value);
      break;
    case 1:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setRandomid(value);
      break;
    case 2:
      var value = new core_types_pb.InputPeer;
      reader.readMessage(value,core_types_pb.InputPeer.deserializeBinaryFromReader);
      msg.setPeer(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setBody(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setReplyto(value);
      break;
    case 7:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setCleardraft(value);
      break;
    case 8:
      var value = new core_types_pb.MessageEntity;
      reader.readMessage(value,core_types_pb.MessageEntity.deserializeBinaryFromReader);
      msg.addEntities(value);
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
proto.msg.ServiceSendMessage.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.msg.ServiceSendMessage.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.msg.ServiceSendMessage} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.msg.ServiceSendMessage.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getOnbehalf();
  if (f !== 0) {
    writer.writeInt64(
      100,
      f
    );
  }
  f = message.getRandomid();
  if (f !== 0) {
    writer.writeInt64(
      1,
      f
    );
  }
  f = message.getPeer();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      core_types_pb.InputPeer.serializeBinaryToWriter
    );
  }
  f = message.getBody();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getReplyto();
  if (f !== 0) {
    writer.writeInt64(
      6,
      f
    );
  }
  f = message.getCleardraft();
  if (f) {
    writer.writeBool(
      7,
      f
    );
  }
  f = message.getEntitiesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      8,
      f,
      core_types_pb.MessageEntity.serializeBinaryToWriter
    );
  }
};


/**
 * optional int64 OnBehalf = 100;
 * @return {number}
 */
proto.msg.ServiceSendMessage.prototype.getOnbehalf = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 100, 0));
};


/**
 * @param {number} value
 * @return {!proto.msg.ServiceSendMessage} returns this
 */
proto.msg.ServiceSendMessage.prototype.setOnbehalf = function(value) {
  return jspb.Message.setProto3IntField(this, 100, value);
};


/**
 * optional int64 RandomID = 1;
 * @return {number}
 */
proto.msg.ServiceSendMessage.prototype.getRandomid = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.msg.ServiceSendMessage} returns this
 */
proto.msg.ServiceSendMessage.prototype.setRandomid = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional InputPeer Peer = 2;
 * @return {?proto.msg.InputPeer}
 */
proto.msg.ServiceSendMessage.prototype.getPeer = function() {
  return /** @type{?proto.msg.InputPeer} */ (
    jspb.Message.getWrapperField(this, core_types_pb.InputPeer, 2));
};


/**
 * @param {?proto.msg.InputPeer|undefined} value
 * @return {!proto.msg.ServiceSendMessage} returns this
*/
proto.msg.ServiceSendMessage.prototype.setPeer = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.msg.ServiceSendMessage} returns this
 */
proto.msg.ServiceSendMessage.prototype.clearPeer = function() {
  return this.setPeer(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.msg.ServiceSendMessage.prototype.hasPeer = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string Body = 5;
 * @return {string}
 */
proto.msg.ServiceSendMessage.prototype.getBody = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.msg.ServiceSendMessage} returns this
 */
proto.msg.ServiceSendMessage.prototype.setBody = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional int64 ReplyTo = 6;
 * @return {number}
 */
proto.msg.ServiceSendMessage.prototype.getReplyto = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {number} value
 * @return {!proto.msg.ServiceSendMessage} returns this
 */
proto.msg.ServiceSendMessage.prototype.setReplyto = function(value) {
  return jspb.Message.setProto3IntField(this, 6, value);
};


/**
 * optional bool ClearDraft = 7;
 * @return {boolean}
 */
proto.msg.ServiceSendMessage.prototype.getCleardraft = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 7, false));
};


/**
 * @param {boolean} value
 * @return {!proto.msg.ServiceSendMessage} returns this
 */
proto.msg.ServiceSendMessage.prototype.setCleardraft = function(value) {
  return jspb.Message.setProto3BooleanField(this, 7, value);
};


/**
 * repeated MessageEntity Entities = 8;
 * @return {!Array<!proto.msg.MessageEntity>}
 */
proto.msg.ServiceSendMessage.prototype.getEntitiesList = function() {
  return /** @type{!Array<!proto.msg.MessageEntity>} */ (
    jspb.Message.getRepeatedWrapperField(this, core_types_pb.MessageEntity, 8));
};


/**
 * @param {!Array<!proto.msg.MessageEntity>} value
 * @return {!proto.msg.ServiceSendMessage} returns this
*/
proto.msg.ServiceSendMessage.prototype.setEntitiesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 8, value);
};


/**
 * @param {!proto.msg.MessageEntity=} opt_value
 * @param {number=} opt_index
 * @return {!proto.msg.MessageEntity}
 */
proto.msg.ServiceSendMessage.prototype.addEntities = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 8, opt_value, proto.msg.MessageEntity, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.msg.ServiceSendMessage} returns this
 */
proto.msg.ServiceSendMessage.prototype.clearEntitiesList = function() {
  return this.setEntitiesList([]);
};


goog.object.extend(exports, proto.msg);
