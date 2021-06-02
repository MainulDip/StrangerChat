import moment from 'moment'

function formatMessage(username: string, text: string) {
  return {
    username,
    text,
    time: moment().format('H:mA')
  }
}

export default formatMessage
