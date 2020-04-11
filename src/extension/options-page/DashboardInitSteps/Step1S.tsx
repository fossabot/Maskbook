import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import StepBase from './StepBase'
import { TextField, makeStyles, createStyles } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import ActionButton from '../DashboardComponents/ActionButton'
import Services from '../../service'
import { InitStep } from '../InitStep'

const useStyles = makeStyles((theme) =>
    createStyles({
        input: {
            width: '100%',
            maxWidth: '320px',
        },
        container: {
            alignSelf: 'stretch',
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
        },
    }),
)

export default function InitStep1S() {
    const { t } = useI18N()
    const header = t('dashboard_init_step_1')
    const subheader = t('dashboard_init_step_1_hint')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')

    const classes = useStyles()
    const history = useHistory()

    const [validationError, setValidationError] = useState<{ name: string; password: string }>({
        name: '',
        password: '',
    })
    const validatePersona = () => {
        setValidationError({
            name: name ? '' : t('error_name_absent'),
            password: password ? '' : t('error_password_absent'),
        })
        return name && password
    }
    const createPersonaAndNext = async () => {
        if (validatePersona()) {
            const persona = await Services.Identity.createPersonaByMnemonic(name, password)
            history.replace(`${InitStep.Setup2}?identifier=${encodeURIComponent(persona.toText())}`)
        }
    }

    const actions = (
        <>
            <ActionButton<typeof Link> variant="outlined" color="default" component={Link} to="start">
                {t('back')}
            </ActionButton>
            <ActionButton variant="contained" color="primary" onClick={createPersonaAndNext} component="a">
                {t('next')}
            </ActionButton>
        </>
    )
    const content = (
        <div className={classes.container}>
            <TextField
                required
                error={!!validationError.name}
                autoFocus
                className={classes.input}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="Name"
                helperText={validationError.name || ' '}></TextField>
            <TextField
                required
                error={!!validationError.password}
                className={classes.input}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                value={password}
                placeholder={t('dashboard_password_hint')}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                label="Password"
                helperText={validationError.password || t('dashboard_password_helper_text')}></TextField>
        </div>
    )

    return (
        <StepBase header={header} subheader={subheader} actions={actions}>
            {content}
        </StepBase>
    )
}
