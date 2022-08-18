// import _ from 'lodash';
// import safeEval from 'safe-eval';

// const DataTransform = function (data, map) {
//   return {
//     defaultOrNull: function (key) {
//       return key && map.defaults ? map.defaults[key] : undefined;
//     },

//     getValue: function (obj, key, newKey = '') {
//       if (typeof obj === 'undefined') {
//         return;
//       }

//       if (key === '' || key === undefined) {
//         return obj;
//       }

//       const value = obj || data;
//       const keys = null;

//       key = key || map.list;
//       return key === '' ? '' : _.get(value, key, this.defaultOrNull(newKey));
//     },

//     setValue: function (obj, key, newValue) {
//       if (typeof obj === 'undefined') {
//         return;
//       }

//       if (key === '' || key === undefined) {
//         return;
//       }

//       if (key === '') {
//         return;
//       }

//       const keys = key.split('.');
//       let target = obj;
//       for (let i = 0; i < keys.length; i++) {
//         if (i === keys.length - 1) {
//           target[keys[i]] = newValue;
//           return;
//         }
//         if (keys[i] in target) target = target[keys[i]];
//         else return;
//       }
//     },

//     getList: function () {
//       return this.getValue(data, map.list);
//     },

//     transform: function (context) {
//       const useList = map.list !== undefined;
//       let value;
//       if (useList) {
//         value = this.getValue(data, map.list);
//       } else if (_.isArray(data) && !useList) {
//         value = data;
//       } else if (_.isObject(data) && !useList) {
//         value = [data];
//       }
//       let normalized = [];

//       if (!_.isEmpty(value)) {
//         const list = useList ? this.getList() : value;
//         normalized = map.item
//           ? _.map(list, _.bind(this.iterator, this, map.item))
//           : list;
//         normalized = _.bind(this.operate, this, normalized)(context);
//         normalized = this.each(normalized, context);
//         normalized = this.removeAll(normalized);
//       }

//       if (!useList && _.isObject(data) && !_.isArray(data)) {
//         return normalized[0];
//       }

//       return normalized;
//     },

//     transformAsync: function (context) {
//       return new Promise((resolve, reject) => {
//         try {
//           resolve(this.transform(context));
//         } catch (err) {
//           reject(err);
//         }
//       });
//     },

//     removeAll: function (data) {
//       if (_.isArray(map.remove)) {
//         return _.each(data, this.remove);
//       }
//       return data;
//     },

//     remove: function (item) {
//       _.each(map.remove, (key) => {
//         delete item[key];
//       });
//       return item;
//     },

//     operate: function (data, context) {
//       if (map.operate) {
//         _.each(
//           map.operate,
//           _.bind(function (method) {
//             data = _.map(
//               data,
//               _.bind((item) => {
//                 let fn;
//                 if ('string' === typeof method.run) {
//                   fn = safeEval(method.run);
//                 } else {
//                   fn = method.run;
//                 }
//                 this.setValue(
//                   item,
//                   method.on,
//                   fn(this.getValue(item, method.on), context)
//                 );
//                 return item;
//               }, this)
//             );
//           }, this)
//         );
//       }
//       return data;
//     },

//     each: function (data, context) {
//       if (map.each) {
//         _.each(data, (value, index, collection) => {
//           return map.each(value, index, collection, context);
//         });
//       }
//       return data;
//     },

//     iterator: function (map, item) {
//       const obj = {};

//       //to support simple arrays with recursion
//       if (typeof map === 'string') {
//         return this.getValue(item, map);
//       }
//       _.each(
//         map,
//         _.bind(function (oldkey, newkey) {
//           if (typeof oldkey === 'string' && oldkey.length > 0) {
//             const value = this.getValue(item, oldkey, newkey);
//             if (value !== undefined) obj[newkey] = value;
//           } else if (_.isArray(oldkey)) {
//             const array = _.map(
//               oldkey,
//               _.bind(
//                 function (item, map) {
//                   return this.iterator(map, item);
//                 },
//                 this,
//                 item
//               )
//             ); //need to swap arguments for bind
//             obj[newkey] = array;
//           } else if (typeof oldkey === 'object') {
//             const bound = _.bind(this.iterator, this, oldkey, item);
//             obj[newkey] = bound();
//           } else {
//             obj[newkey] = '';
//           }
//         }, this)
//       );
//       return obj;
//     },
//   };
// };

// exports.DataTransform = DataTransform;

// exports.transform = function (data, map, context) {
//   const dataTransform = new DataTransform(data, map);
//   return dataTransform.transform(context);
// };

// exports.transformAsync = function (data, map, context) {
//   const dataTransform = new DataTransform(data, map);
//   return dataTransform.transformAsync(context);
// };
export {};
