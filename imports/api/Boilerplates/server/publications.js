import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Boilerplates from '../Boilerplates';

Meteor.publish('boilerplates', function boilerplates() {
  return Boilerplates.find({ submitter: this.userId });
});

// Note: documents.view is also used when editing an existing document.
Meteor.publish('boilerplates.view', function boilerplatesView(documentId) {
  check(documentId, String);
  return Boilerplates.find({ _id: documentId, owner: this.userId });
});
