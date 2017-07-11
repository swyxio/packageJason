import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Boilerplates from '../Boilerplates';

Meteor.publish('boilerplates', function boilerplates() {
  // https://stackoverflow.com/questions/13957691/how-can-i-sort-a-meteor-collection-by-time-of-insertion
  // return Boilerplates.find({ submitter: this.userId }, { sort: { scoreratio: -1 } });
  return Boilerplates.find({}, { sort: { scoreratio: -1 } });
});

// Note: documents.view is also used when editing an existing document.
Meteor.publish('boilerplates.view', function boilerplatesView(documentId) {
  check(documentId, String);
  return Boilerplates.find({ _id: documentId, submitter: this.userId });
});
