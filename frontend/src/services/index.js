/**
 * Services Index
 * 
 * This file exports all service modules for easy importing throughout the application.
 */

import authService from './auth.service';
import studentService from './student.service';
import classService from './class.service';
import batchService from './batch.service';
import subjectService from './subject.service';
import classTimingService from './class-timing.service';
import messageTemplateService from './message-template.service';
import messageService from './message.service';

export {
  authService,
  studentService,
  classService,
  batchService,
  subjectService,
  classTimingService,
  messageTemplateService,
  messageService
};

export default {
  auth: authService,
  student: studentService,
  class: classService,
  batch: batchService,
  subject: subjectService,
  classTiming: classTimingService,
  messageTemplate: messageTemplateService,
  message: messageService
};
