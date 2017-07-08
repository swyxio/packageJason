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
  title: {
    type: String,
    label: 'The name of the boilerplate.',
  },
  url: {
    type: String,
    label: 'The body of the boilerplate.',
  },
  metadata: {
    type: String,
    label: 'The metadata of the boilerplate.',
  },
});

Boilerplates.attachSchema(Boilerplates.schema);

export default Boilerplates;
