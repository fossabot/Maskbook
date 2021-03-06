import type { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { texts } from './createSettings'
import {
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Switch,
    Select,
    MenuItem,
    makeStyles,
    ListItemIcon,
    SelectProps,
    createStyles,
} from '@material-ui/core'
import React from 'react'

function withDefaultText<T>(props: SettingsUIProps<T>): SettingsUIProps<T> {
    const { value, primary, secondary } = props
    const text = texts.get(value)
    return {
        value,
        primary: primary ?? text?.primary?.() ?? '_unknown_setting_',
        secondary: secondary ?? text?.secondary?.(),
    }
}

type SettingsUIProps<T> = {
    value: ValueRef<T>
    primary?: React.ReactNode
    secondary?: React.ReactNode
    icon?: React.ReactElement
}

export function SettingsUI<T>(props: SettingsUIProps<T>) {
    const { value, primary, secondary } = withDefaultText(props)
    const currentValue = useValueRef(value)
    switch (typeof currentValue) {
        case 'boolean':
            const [ui, change] = getBooleanSettingsUI(value as any, currentValue)
            return (
                <ListItem button onClick={change}>
                    {props.icon ? <ListItemIcon>{props.icon}</ListItemIcon> : null}
                    <ListItemText primary={primary} secondary={secondary} />
                    <ListItemSecondaryAction>{ui}</ListItemSecondaryAction>
                </ListItem>
            )
        default:
            return (
                <ListItem>
                    <ListItemText primary={'Not implemented for type' + typeof currentValue} />
                </ListItem>
            )
    }
}

const useListItemStyles = makeStyles((theme) =>
    createStyles({
        container: { listStyleType: 'none', width: '100%' },
        secondaryAction: { paddingRight: 90 + theme.spacing(2) },
    }),
)

const useStyles = makeStyles({
    secondaryAction: { width: 90 },
})

export function SettingsUIEnum<T extends object>(
    props: {
        enumObject: T
        getText?: useEnumSettingsParams<T>[2]
        SelectProps?: SelectProps
    } & SettingsUIProps<T[keyof T]>,
) {
    const { primary, secondary } = withDefaultText(props)
    const listClasses = useListItemStyles()
    const classes = useStyles()
    const [ui, change] = useEnumSettings(props.value, props.enumObject, props.getText, props.SelectProps)
    return (
        <ListItem component="div" classes={listClasses}>
            {props.icon ? <ListItemIcon>{props.icon}</ListItemIcon> : null}
            <ListItemText primary={primary} secondary={secondary} />
            <ListItemSecondaryAction className={classes.secondaryAction}>{ui}</ListItemSecondaryAction>
        </ListItem>
    )
}
type HookedUI<T> = [/** UI */ React.ReactNode, /** Changer */ T extends void ? () => void : (value: T) => void]
/**
 * Convert a ValueRef<boolean> into a Switch element.
 * This must not be a React hook because it need to run in a switch stmt
 */
function getBooleanSettingsUI(ref: ValueRef<boolean>, currentValue: boolean): HookedUI<void> {
    const change = () => (ref.value = !ref.value)
    const ui = <Switch edge="end" checked={currentValue} onClick={change} />
    return [ui, change]
}
// TODO: should become generic in future
export function useSettingsUI(ref: ValueRef<boolean>) {
    const currentValue = useValueRef(ref)
    return getBooleanSettingsUI(ref, currentValue)
}
/**
 * Convert a ValueRef<Enum> into a Select element.
 * @param ref - The value ref
 * @param enumObject - The enum object
 * @param getText - Convert enum value into string.
 *
 * ? because the limit on the type system, I can't type it as an object which key is enum and value is string
 */
function useEnumSettings<Q extends object>(
    ...[ref, enumObject, getText, selectProps]: useEnumSettingsParams<Q>
): HookedUI<Q[keyof Q]> {
    const enum_ = Object.keys(enumObject)
        // Leave only key of enum
        .filter((x) => Number.isNaN(parseInt(x)))
        .map((key) => ({ key, value: enumObject[key as keyof Q] }))
    const change = (value: any) => {
        if (!Number.isNaN(parseInt(value))) {
            value = parseInt(value)
        }
        if (!enum_.some((x) => x.value === value)) {
            console.log(value)
            throw new Error('Invalid state')
        }
        ref.value = value
    }
    const ui = (
        <Select {...selectProps} value={useValueRef(ref)} onChange={(event) => change(event.target.value)}>
            {enum_.map(({ key, value }) => (
                <MenuItem value={String(value)} key={String(key)}>
                    {getText?.(value) ?? String(key)}
                </MenuItem>
            ))}
        </Select>
    )
    return [ui, change as any]
}
type useEnumSettingsParams<Q extends object> = [
    ValueRef<Q[keyof Q]>,
    Q,
    ((x: Q[keyof Q]) => string) | undefined,
    SelectProps | undefined,
]
