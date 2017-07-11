import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Boilerplates from './Boilerplates';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'boilerplates.insert': function boilerplatesInsert(doc) {
    // console.log('boilerplates insert', doc.ownerrepo);
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
