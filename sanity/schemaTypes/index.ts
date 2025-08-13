import { type SchemaTypeDefinition } from 'sanity'
import { author } from './author'
import { startup } from './startup'
import { playlist } from './playlist'
import { vote } from './vote'
import { comment } from './comment'
import { feedback } from './feedback'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [author, startup, playlist, vote, comment, feedback],
}