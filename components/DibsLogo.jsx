import Svg, { Path } from 'react-native-svg'

export default function DibsLogo({
  size = 64,
  color = '#32FF7E',
  fill = '#fff'
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
    >
      {/* Rounded D */}
      <Path
        d="
            M18 10
            H30
            C45 10 54 20 54 32
            C54 44 45 54 30 54
            H18
            Q14 54 14 50
            V14
            Q14 10 18 10
            Z
        "
        fill={color}
        />

      {/* Larger pin */}
      <Path
        d="
          M32 18
          C26.5 18 22 22.5 22 28
          C22 35.5 32 48 32 48
          C32 48 42 35.5 42 28
          C42 22.5 37.5 18 32 18
          Z

          M32 32
          C29.8 32 28 30.2 28 28
          C28 25.8 29.8 24 32 24
          C34.2 24 36 25.8 36 28
          C36 30.2 34.2 32 32 32
          Z
        "
        fill={fill}
      />
    </Svg>
  )
}