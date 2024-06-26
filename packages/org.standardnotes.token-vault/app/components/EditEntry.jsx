import QRCodeReader from '@Components/QRCodeReader'
import { secretPattern } from '@Lib/otp'
import { contextualColors, defaultBgColor, getAllContextualColors, getEntryColor } from '@Lib/utils'
import { SKAlert } from '@standardnotes/styles'
import PropTypes from 'prop-types'
import React from 'react'
import { TwitterPicker } from 'react-color'

export default class EditEntry extends React.Component {
  static defaultProps = {
    entry: {
      service: '',
      account: '',
      secret: '',
      notes: '',
    },
  }

  constructor(props) {
    super(props)

    const { id, entry } = props

    this.state = {
      id: id,
      entry,
      showColorPicker: false,
      qrCodeError: false,
      is2fa: id !== undefined ? !!entry.secret : true,
    }
  }

  formatSecret(secret) {
    return secret.replace(/\s/g, '').toUpperCase()
  }

  handleInputChange = (event) => {
    const target = event.target
    const name = target.name

    const value = name === 'secret' ? this.formatSecret(target.value) : target.value

    this.setState((state) => ({
      entry: {
        ...state.entry,
        [name]: value,
      },
    }))
  }

  handleSwatchClick = () => {
    this.setState({
      showColorPicker: !this.state.showColorPicker,
    })
  }

  handleColorPickerClose = () => {
    this.setState({
      showColorPicker: false,
    })
  }

  removeColor = () => {
    this.setState((state) => {
      delete state.entry.color
      return {
        entry: state.entry,
      }
    })
  }

  onSave = () => {
    const { id, entry, is2fa } = this.state
    this.props.onSave({
      id,
      entry: {
        ...entry,
        secret: is2fa ? entry.secret : '',
      },
    })
  }

  onQRCodeSuccess = (otpData) => {
    const { issuer: labelIssuer, account } = otpData.label
    const { issuer: queryIssuer, secret } = otpData.query

    this.setState({
      entry: {
        service: labelIssuer || queryIssuer || '',
        account,
        secret: this.formatSecret(secret),
      },
      is2fa: true,
    })
  }

  onQRCodeError = (message) => {
    this.setState({
      qrCodeError: message,
    })
  }

  dismissQRCodeError = () => {
    this.setState({
      qrCodeError: false,
    })
  }

  render() {
    const { id, entry, showColorPicker, qrCodeError, is2fa } = this.state

    const qrCodeAlert = new SKAlert({
      title: 'Error',
      text: qrCodeError,
      buttons: [
        {
          text: 'OK',
          style: 'info',
          action: this.dismissQRCodeError,
        },
      ],
    })

    if (qrCodeError) {
      qrCodeAlert.present()
    }

    const entryColor = getEntryColor(document, entry)
    const swatchStyle = {
      width: '36px',
      height: '14px',
      borderRadius: '2px',
      background: `${entryColor ?? defaultBgColor}`,
    }

    const themeColors = getAllContextualColors(document)
    const defaultColorOptions = [...themeColors, '#658bdb', '#4CBBFC', '#FF794D', '#EF5276', '#91B73D', '#9B7ECF']

    const handleColorChange = (color) => {
      let selectedColor = color.hex.toUpperCase()
      const colorIndex = defaultColorOptions.indexOf(selectedColor)

      if (colorIndex > -1 && colorIndex <= themeColors.length - 1) {
        selectedColor = contextualColors[colorIndex]
      }

      this.setState((state) => ({
        entry: {
          ...state.entry,
          color: selectedColor,
        },
      }))
    }

    const handleTypeChange = ({ target }) => {
      this.setState({
        is2fa: target.value === '2fa',
      })
    }

    return (
      <div className="auth-edit sk-panel">
        <div className="sk-panel-content">
          <div className="sk-panel-section">
            <div className="sk-panel-section-title sk-panel-row">
              <div className="sk-panel-row">
                <div className="left-header">
                  <div className="sk-panel-section-title pr-4">{id != null ? 'Edit entry' : 'Add new entry'}</div>
                  <div className="sk-input-group" onChange={handleTypeChange}>
                    <label>
                      <input className="sk-input" type="radio" value="2fa" name="type" defaultChecked={is2fa} /> 2FA
                    </label>
                    <label>
                      <input className="sk-input" type="radio" value="password" name="type" defaultChecked={!is2fa} />{' '}
                      Password only
                    </label>
                  </div>
                </div>
              </div>
              <div className="sk-panel-section-title sk-panel-row">
                {id == null && <QRCodeReader onSuccess={this.onQRCodeSuccess} onError={this.onQRCodeError} />}
                <>
                  {entryColor && (
                    <div className="sk-button danger" onClick={this.removeColor}>
                      <div className="sk-label">Clear color</div>
                    </div>
                  )}
                  <div className="color-picker-swatch" onClick={this.handleSwatchClick}>
                    <div style={swatchStyle} />
                  </div>
                </>
              </div>
            </div>
            <form onSubmit={this.onSave} autoComplete="off">
              <div className="sk-panel-section">
                <input
                  name="service"
                  className="sk-input contrast"
                  placeholder="Service"
                  value={entry.service}
                  onChange={this.handleInputChange}
                  type="text"
                  required
                />
                <input
                  name="account"
                  className="sk-input contrast"
                  placeholder="Account"
                  value={entry.account}
                  onChange={this.handleInputChange}
                  type="text"
                />
                {is2fa && (
                  <input
                    name="secret"
                    className="sk-input contrast"
                    placeholder="Secret"
                    value={entry.secret}
                    onChange={this.handleInputChange}
                    type="text"
                    pattern={secretPattern}
                    required
                  />
                )}
                <input
                  name="password"
                  className="sk-input contrast"
                  placeholder={`Password ${is2fa ? '(optional)' : ''}`}
                  value={entry.password}
                  onChange={this.handleInputChange}
                  type="text"
                  required={!is2fa}
                />
                <input
                  name="notes"
                  className="sk-input contrast"
                  placeholder="Notes"
                  value={entry.notes}
                  onChange={this.handleInputChange}
                  type="text"
                />
              </div>
              {showColorPicker && (
                <div className="color-picker-popover">
                  <div className="color-picker-cover" onClick={this.handleColorPickerClose} />
                  <TwitterPicker
                    color={entryColor}
                    colors={defaultColorOptions}
                    onChangeComplete={handleColorChange}
                    triangle="top-right"
                    onSwatchHover={(color, event) => {
                      const hoveredColor = color.hex.toUpperCase()
                      if (themeColors.includes(hoveredColor)) {
                        event.target.setAttribute('title', 'This color will change depending on your active theme.')
                      }
                    }}
                  />
                </div>
              )}
              <div className="sk-panel-section">
                <div className="sk-button-group stretch">
                  <button type="button" className="sk-button neutral" onClick={this.props.onCancel}>
                    <div className="sk-label">Cancel</div>
                  </button>
                  <button type="submit" className="sk-button info">
                    <div className="sk-label">{id != null ? 'Save' : 'Create'}</div>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

EditEntry.propTypes = {
  id: PropTypes.number,
  entry: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}
