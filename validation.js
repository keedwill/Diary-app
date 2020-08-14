//validation
const joi = require("joi");

const storySchema = joi.object({
  title: joi.string().required(),
  body: joi.string().required(),
  status:joi.string().required(),
  image:joi.string().allow('')
});

module.exports = { storySchema: storySchema };
