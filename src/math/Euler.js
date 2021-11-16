import { Quaternion } from './Quaternion.js';
import { Vector3 } from './Vector3.js';
import { Matrix4 } from './Matrix4.js';
import { clamp } from './MathUtils.js';

const _matrix = /*@__PURE__*/ new Matrix4();
const _quaternion = /*@__PURE__*/ new Quaternion();

/**
 *
 * @description 欧拉角描述一个旋转变换，通过指定轴顺序和其各个轴向上的指定旋转角度来旋转一个物体
 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
 * @class Euler
 */
class Euler {

	constructor( x = 0, y = 0, z = 0, order = Euler.DefaultOrder ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;

	}

	get x() {

		return this._x;

	}

	set x( value ) {

		this._x = value;
		this._onChangeCallback();

	}

	get y() {

		return this._y;

	}

	set y( value ) {

		this._y = value;
		this._onChangeCallback();

	}

	get z() {

		return this._z;

	}

	set z( value ) {

		this._z = value;
		this._onChangeCallback();

	}

	get order() {

		return this._order;

	}

	/**
	 *
	 * @description 设置旋转顺序
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @memberof Euler
	 */
	set order( value ) {

		this._order = value;
		this._onChangeCallback();

	}

	set( x, y, z, order = this._order ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;

		this._onChangeCallback();

		return this;

	}

	clone() {

		return new this.constructor( this._x, this._y, this._z, this._order );

	}

	copy( euler ) {

		this._x = euler._x;
		this._y = euler._y;
		this._z = euler._z;
		this._order = euler._order;

		this._onChangeCallback();

		return this;

	}

	/**
	 *
	 * @description 使用基于 order 顺序的纯旋转矩阵来设置当前欧拉角。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} m  Matrix4 矩阵上面的3x3部分是一个纯旋转矩阵rotation matrix （也就是不发生缩放）
	 * @param {*} [order=this._order] (可选参数) 表示旋转顺序的字符串
	 * @param {boolean} [update=true] 是否更新
	 * @return {*} 
	 * @memberof Euler
	 */
	setFromRotationMatrix( m, order = this._order, update = true ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		const te = m.elements;
		const m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ];
		const m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ];
		const m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];

		switch ( order ) {

			case 'XYZ':

				this._y = Math.asin( clamp( m13, - 1, 1 ) );

				if ( Math.abs( m13 ) < 0.9999999 ) {

					this._x = Math.atan2( - m23, m33 );
					this._z = Math.atan2( - m12, m11 );

				} else {

					this._x = Math.atan2( m32, m22 );
					this._z = 0;

				}

				break;

			case 'YXZ':

				this._x = Math.asin( - clamp( m23, - 1, 1 ) );

				if ( Math.abs( m23 ) < 0.9999999 ) {

					this._y = Math.atan2( m13, m33 );
					this._z = Math.atan2( m21, m22 );

				} else {

					this._y = Math.atan2( - m31, m11 );
					this._z = 0;

				}

				break;

			case 'ZXY':

				this._x = Math.asin( clamp( m32, - 1, 1 ) );

				if ( Math.abs( m32 ) < 0.9999999 ) {

					this._y = Math.atan2( - m31, m33 );
					this._z = Math.atan2( - m12, m22 );

				} else {

					this._y = 0;
					this._z = Math.atan2( m21, m11 );

				}

				break;

			case 'ZYX':

				this._y = Math.asin( - clamp( m31, - 1, 1 ) );

				if ( Math.abs( m31 ) < 0.9999999 ) {

					this._x = Math.atan2( m32, m33 );
					this._z = Math.atan2( m21, m11 );

				} else {

					this._x = 0;
					this._z = Math.atan2( - m12, m22 );

				}

				break;

			case 'YZX':

				this._z = Math.asin( clamp( m21, - 1, 1 ) );

				if ( Math.abs( m21 ) < 0.9999999 ) {

					this._x = Math.atan2( - m23, m22 );
					this._y = Math.atan2( - m31, m11 );

				} else {

					this._x = 0;
					this._y = Math.atan2( m13, m33 );

				}

				break;

			case 'XZY':

				this._z = Math.asin( - clamp( m12, - 1, 1 ) );

				if ( Math.abs( m12 ) < 0.9999999 ) {

					this._x = Math.atan2( m32, m22 );
					this._y = Math.atan2( m13, m11 );

				} else {

					this._x = Math.atan2( - m23, m33 );
					this._y = 0;

				}

				break;

			default:

				console.warn( 'THREE.Euler: .setFromRotationMatrix() encountered an unknown order: ' + order );

		}

		this._order = order;

		if ( update === true ) this._onChangeCallback();

		return this;

	}

	/**
	 *
	 * @description 根据 order 指定的方向，使用归一化四元数设置这个欧拉变换的角度
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} q
	 * @param {*} order
	 * @param {*} update
	 * @return {*} 
	 * @memberof Euler
	 */
	setFromQuaternion( q, order, update ) {

		_matrix.makeRotationFromQuaternion( q );

		return this.setFromRotationMatrix( _matrix, order, update );

	}

	/**
	 *
	 * @description 通过向量设置欧拉角
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @param {*} [order=this._order]
	 * @return {*} 
	 * @memberof Euler
	 */
	setFromVector3( v, order = this._order ) {

		return this.set( v.x, v.y, v.z, order );

	}

	/**
	 *
	 * @description 通过这个欧拉角创建一个四元数，然后用这个四元数和新顺序设置这个欧拉角
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} newOrder
	 * @return {*} 
	 * @memberof Euler
	 */
	reorder( newOrder ) {

		// 警告: 这将弃用旋转信息
		// WARNING: this discards revolution information -bhouston

		_quaternion.setFromEuler( this );

		return this.setFromQuaternion( _quaternion, newOrder );

	}

	equals( euler ) {

		return ( euler._x === this._x ) && ( euler._y === this._y ) && ( euler._z === this._z ) && ( euler._order === this._order );

	}

	fromArray( array ) {

		this._x = array[ 0 ];
		this._y = array[ 1 ];
		this._z = array[ 2 ];
		if ( array[ 3 ] !== undefined ) this._order = array[ 3 ];

		this._onChangeCallback();

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;
		array[ offset + 3 ] = this._order;

		return array;

	}


	/**
	 *
	 * @description (可选参数) 如果指定了该参数结果将会被复制给该参数，否者会创建一个新的 Vector3
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} optionalResult
	 * @return {*} 
	 * @memberof Euler
	 */
	toVector3( optionalResult ) {

		if ( optionalResult ) {

			return optionalResult.set( this._x, this._y, this._z );

		} else {

			return new Vector3( this._x, this._y, this._z );

		}

	}

	_onChange( callback ) {

		this._onChangeCallback = callback;

		return this;

	}

	_onChangeCallback() {}

}

Euler.prototype.isEuler = true;

// 默认值为 'XYZ'，这意味着对象将首先是 绕X轴旋转，然后是Y轴，最后是Z轴
// 这意味着旋转是在本地坐标系下进行的。
// 也就是说，对于“XYZ”顺序，
// 首先是围绕local-X轴旋转(与world- x轴相同)， 
// 然后是local-Y(现在可能与world y轴不同)，
// 然后是local-Z(可能与world z轴不同)
Euler.DefaultOrder = 'XYZ';

Euler.RotationOrders = [ 'XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX' ];

export { Euler };
