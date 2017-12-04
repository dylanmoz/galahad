// @flow

import moize from 'moize'
import type { Fn, Config } from 'moize/flow-typed/moize'

const DISABLE = process.env.DISABLE_MOIZE

export default (fn: Fn, config: Config) => (DISABLE ? fn : moize(fn, config))
