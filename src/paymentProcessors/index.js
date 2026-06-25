const mockProcessor = require('./mockProcessor')

const processors = {
  mock: mockProcessor
}

function getProcessor(name = process.env.PAYMENT_PROCESSOR || 'mock') {
  const processor = processors[name]
  if (!processor) {
    throw new Error(`Payment processor "${name}" is not registered`)
  }
  return processor
}

function registerProcessor(name, processor) {
  if (!name || !processor || typeof processor.processDonation !== 'function') {
    throw new Error('Processor must define a processDonation function')
  }
  processors[name] = processor
}

module.exports = {
  getProcessor,
  registerProcessor
}
