/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Boilerplates = new Mongo.Collection('Boilerplates');

Boilerplates.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Boilerplates.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Boilerplates.schema = new SimpleSchema({
  submitter: {
    type: String,
    label: 'The submitter of this boilerplate',
  },
  createdAt: {
    type: String,
    label: 'The date this document was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
    },
  },
  updatedAt: {
    type: String,
    label: 'The date this document was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
    },
  },
  ownerrepo: {
    type: String,
    label: 'The name of the boilerplate.',
  },
  cogload: {
    type: Number,
    label: 'The cognitive load of the boilerplate.',
  },
  intload: {
    type: Number,
    label: 'The internal load of the boilerplate.',
  },
  extload: {
    type: Number,
    label: 'The external load of the boilerplate.',
  },
  popScore: {
    type: Number,
    label: 'The popularity score of the boilerplate.',
  },
  scoreratio: {
    type: Number,
    label: 'The score ratio of the boilerplate.',
  },
  dependencies: {
    type: Array,
    label: 'The dependencies of the boilerplate.',
  },
  'dependencies.$': {
    type: String,
  },
  boilerplateReview: {
    type: String,
    label: 'The review of the boilerplate',
  },
  boilerplateKeywords: {
    type: Array,
    label: 'The special keywords of the boilerplate',
  },
  'boilerplateKeywords.$': {
    type: String,
  },
});

Boilerplates.attachSchema(Boilerplates.schema);

export default Boilerplates;
