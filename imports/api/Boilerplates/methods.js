import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Boilerplates from './Boilerplates';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'boilerplates.insert': function boilerplatesInsert(doc) {
    console.log('boilerplates insert', doc);
    check(doc, {
      ownerrepo: String,
      boilerplateReview: String,
      cogload: Number,
      intload: Number,
      extload: Number,
      popScore: Number,
      scoreratio: Number,
      dependencies: Array,
      boilerplateKeywords: Array,
    });

    try {
      return Boilerplates.insert({ submitter: this.userId, ...doc });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'boilerplates.update': function boilerplatesUpdate(doc) {
    check(doc, {
      _id: String,
      ownerrepo: String,
      boilerplateReview: String,
      cogload: Number,
      intload: Number,
      extload: Number,
      popScore: Number,
      scoreratio: Number,
      dependencies: Array,
      boilerplateKeywords: Array,
    });

    try {
      const documentId = doc._id;
      Boilerplates.update(documentId, { $set: doc });
      return documentId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'boilerplates.remove': function boilerplatesRemove(documentId) {
    check(documentId, String);

    try {
      return Boilerplates.remove(documentId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'boilerplates.heart': async function boilerplatesHeart(documentId) {
    check(documentId, String);

    try {
      const doc = await Boilerplates.findOne({ _id: documentId });
      console.log('heartdoc', doc.userHearts);
      console.log('thisuserid', this.userId);
      const dh = doc.userHearts;
      if (dh.includes(this.userId)) {
        if (dh.indexOf(this.userId) > -1) dh.splice(dh.indexOf(this.userId), 1);
        doc.userHearts = dh;
      } else {
        dh.push(this.userId);
        doc.userHearts = dh;
      }
      console.log('heartdoc2', doc.userHearts);
      Boilerplates.update(documentId, { $set: doc });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'boilerplates.insert',
    'boilerplates.update',
    'boilerplates.remove',
  ],
  limit: 5,
  timeRange: 1000,
});
