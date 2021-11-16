import * as MathUtils from './MathUtils.js';
import { Quaternion } from './Quaternion.js';

class Vector3 {

	constructor( x = 0, y = 0, z = 0 ) {

		this.x = x;
		this.y = y;
		this.z = z;

	}

	/**
	 *
	 * @description 设置三维向量
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} x
	 * @param {*} y
	 * @param {*} z
	 * @return {*} 
	 * @memberof Vector3
	 */
	set( x, y, z ) {

		if ( z === undefined ) z = this.z; // sprite.scale.set(x,y)

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	}

	/**
	 *
	 * @description 设置缩放比例
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} scalar
	 * @return {*} 
	 * @memberof Vector3
	 */
	setScalar( scalar ) {

		this.x = scalar;
		this.y = scalar;
		this.z = scalar;

		return this;

	}

	/**
	 *
	 * @description 设置X轴坐标
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} x
	 * @return {*} 
	 * @memberof Vector3
	 */
	setX( x ) {

		this.x = x;

		return this;

	}

	/**
	 *
	 * @description 设置Y轴坐标
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} y
	 * @return {*} 
	 * @memberof Vector3
	 */
	setY( y ) {

		this.y = y;

		return this;

	}

	/**
	 *
	 * @description 设置Z轴坐标
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} z
	 * @return {*} 
	 * @memberof Vector3
	 */
	setZ( z ) {

		this.z = z;

		return this;

	}

	/**
	 *
	 * @description 根据索引设置3维向量
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} index
	 * @param {*} value
	 * @return {*} 
	 * @memberof Vector3
	 */
	setComponent( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			default: throw new Error( 'index is out of range: ' + index );

		}

		return this;

	}

	/**
	 *
	 * @description 根据索引获取坐标值
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} index
	 * @return {*} 
	 * @memberof Vector3
	 */
	getComponent( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw new Error( 'index is out of range: ' + index );

		}

	}

	/**
	 *
	 * @description 克隆
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof Vector3
	 */
	clone() {

		return new this.constructor( this.x, this.y, this.z );

	}

	/**
	 *
	 * @description 复制三维向量
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @return {*} 
	 * @memberof Vector3
	 */
	copy( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	}

	/**
	 *
	 * @description 三维向量相加
	 * 几何意义: 合并 v , w 分量 , v的尾到w的头
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @param {*} w
	 * @return {*} 
	 * @memberof Vector3
	 */
	add( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
			return this.addVectors( v, w );

		}

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	}

	/**
	 *
	 * @description 向量x,y,z分量与s标量相加
	 * 几何意义: 向量分别向 x , y ，z轴平移s
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} s
	 * @return {*} 
	 * @memberof Vector3
	 */
	addScalar( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	}

	/**
	 *
	 * @description 向量 a + b 相加
	 * 几何意义: 合并a + b 分量 a的尾到b的头
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} a
	 * @param {*} b
	 * @return {*} 
	 * @memberof Vector3
	 */
	addVectors( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	}

	/**
	 *
	 * @description 向量 a + b(经过缩放) 相加
	 * 几何意义: 合并a + b(经过缩放)  分量 a的尾到b的头
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @param {*} s
	 * @return {*} 
	 * @memberof Vector3
	 */
	addScaledVector( v, s ) {

		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;

		return this;

	}

	/**
	 *
	 * @description 向量v ,w相减(不满足交换律)
	 * 几何意义: v - w 分量 ; v的尾到w的尾
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @param {*} w
	 * @return {*} 
	 * @memberof Vector3
	 */
	sub( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
			return this.subVectors( v, w );

		}

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	}

	/**
	 *
	 * @description 向量x,y,z分量与s标量相减
	 * 几何意义: 向量分别向 x , y ，z轴平移s
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} s
	 * @return {*} 
	 * @memberof Vector3
	 */
	subScalar( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	}

	/**
	 * @description 三维向量 a , b 相减
	 * 几何意义: a -b 分量 ; a的尾到b的尾
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} a
	 * @param {*} b
	 * @return {*} 
	 * @memberof Vector3
	 */
	subVectors( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	}

	/**
	 *
	 * @description 三维向量与 v 向量相乘
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @param {*} w
	 * @return {*} 
	 * @memberof Vector3
	 */
	multiply( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.' );
			return this.multiplyVectors( v, w );

		}

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	}

	/**
	 *
	 * @description 向量与标量相乘
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} scalar
	 * @return {*} 
	 * @memberof Vector3
	 */
	multiplyScalar( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	}

	/**
	 *
	 * @description 向量a,b相乘
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} a
	 * @param {*} b
	 * @return {*} 
	 * @memberof Vector3
	 */
	multiplyVectors( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	}

	/**
	 *
	 * @description 当前向量通过参数euler(THREE.Euler对象,欧拉对象)转换成四元数
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} euler
	 * @return {*} 
	 * @memberof Vector3
	 */
	applyEuler( euler ) {

		if ( ! ( euler && euler.isEuler ) ) {

			console.error( 'THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.' );

		}

		return this.applyQuaternion( _quaternion.setFromEuler( euler ) );

	}

	/**
	 *
	 * @description 当前向量根据指定的轴(一个标准单位的向量),和角度旋转
	 * 或者说根据指定的轴和角度应用旋转
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} axis
	 * @param {*} angle
	 * @return {*} 
	 * @memberof Vector3
	 */
	applyAxisAngle( axis, angle ) {

		return this.applyQuaternion( _quaternion.setFromAxisAngle( axis, angle ) );

	}

	/**
	 *
	 * @description 当前向量乘以一个3x3的矩阵
	 * 几何意义： 对当前向量做线性变换 ， 不含平移
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} m
	 * @return {*} 
	 * @memberof Vector3
	 */
	applyMatrix3( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

		return this;

	}

	/**
	 *
	 * @description 应用正规矩阵
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} m
	 * @return {*} 
	 * @memberof Vector3
	 */
	applyNormalMatrix( m ) {

		return this.applyMatrix3( m ).normalize();

	}

	/**
	 *
	 * @description 当前向量乘以一个4x4的矩阵
	 * 几何意义： 对当前向量做仿射变换 ， 包含平移
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} m
	 * @return {*} 
	 * @memberof Vector3
	 */
	applyMatrix4( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

		this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
		this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
		this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

		return this;

	}

	/**
	 *
	 * @description 用一个四元数q变换当前3维向量
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} q
	 * @return {*} 
	 * @memberof Vector3
	 */
	applyQuaternion( q ) {

		const x = this.x, y = this.y, z = this.z;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// calculate quat * vector

		const ix = qw * x + qy * z - qz * y;
		const iy = qw * y + qz * x - qx * z;
		const iz = qw * z + qx * y - qy * x;
		const iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;

	}

	/**
	 *
	 * @description 对向量做相机投影
	 * 几何意义： 向量v × 投影矩阵 × 相机的世界矩阵的逆（右乘）
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} camera
	 * @return {*} 
	 * @memberof Vector3
	 */
	project( camera ) {

		return this.applyMatrix4( camera.matrixWorldInverse ).applyMatrix4( camera.projectionMatrix );

	}

	/**
	 *
	 * @description 对向量做相机反投影
	 * 几何意义：投影向量反投影回世界向量  向量v × 世界矩阵 × 相机的投影矩阵的逆
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} camera
	 * @return {*} 
	 * @memberof Vector3
	 */
	unproject( camera ) {

		return this.applyMatrix4( camera.projectionMatrixInverse ).applyMatrix4( camera.matrixWorld );

	}

	/**
	 *
	 * @description 通过参数m(一个Matrix4投射矩阵的3x3子集)转换这个向量的方向
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} m 4×4投影矩阵，仿射矩阵
	 * @return {*} 单位化矩阵
	 * @memberof Vector3
	 */
	transformDirection( m ) {

		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		return this.normalize();

	}

	/**
	 *
	 * 三维向量的(x,y,z)坐标值与参数v的(x,y,z)相除.并返回新的坐标值的三维向量
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @return {*} 
	 * @memberof Vector3
	 */
	divide( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	}

	/**
	 *
	 * @description 三维向量的(x,y,z)坐标值直接与参数scalar相除.并返回新的坐标值的三维向量
	 * 几何意义：三维向量的缩放
	 * 参数scalar不能为0
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} scalar
	 * @return {*} 
	 * @memberof Vector3
	 */
	divideScalar( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	}

	/**
	 *
	 * @description 返回最小值
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @return {*} 
	 * @memberof Vector3
	 */
	min( v ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );
		this.z = Math.min( this.z, v.z );

		return this;

	}

	/**
	 *
	 * @description 返回最大值
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @return {*} 
	 * @memberof Vector3
	 */
	max( v ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );
		this.z = Math.max( this.z, v.z );

		return this;

	}

	/**
	 *
	 * @description 返回区间值
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} min
	 * @param {*} max
	 * @return {*} 
	 * @memberof Vector3
	 */
	clamp( min, max ) {

		// assumes min < max, componentwise

		this.x = Math.max( min.x, Math.min( max.x, this.x ) );
		this.y = Math.max( min.y, Math.min( max.y, this.y ) );
		this.z = Math.max( min.z, Math.min( max.z, this.z ) );

		return this;

	}

	clampScalar( minVal, maxVal ) {

		this.x = Math.max( minVal, Math.min( maxVal, this.x ) );
		this.y = Math.max( minVal, Math.min( maxVal, this.y ) );
		this.z = Math.max( minVal, Math.min( maxVal, this.z ) );

		return this;

	}

	clampLength( min, max ) {

		const length = this.length();

		return this.divideScalar( length || 1 ).multiplyScalar( Math.max( min, Math.min( max, length ) ) );

	}

	/**
	 *
	 * @description 向下取整
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof Vector3
	 */
	floor() {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );

		return this;

	}


	/**
	 *
	 * @description 向上取整
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof Vector3
	 */
	ceil() {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );

		return this;

	}


	/**
	 *
	 * @description 四舍五入
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof Vector3
	 */
	round() {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );

		return this;

	}

	roundToZero() {

		this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
		this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );

		return this;

	}

	/**
	 *
	 * @description 负向量
	 * 几何意义：和原向量大小相等，方向相反的向量
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof Vector3
	 */
	negate() {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;

		return this;

	}

	/**
	 *
	 * @description 三维向量点乘（点积）
	 * 几何意义：向量大小与向量夹角cos的积  a.b =||a|| ||b|| cos0
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @return {*} 
	 * @memberof Vector3
	 */
	dot( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	}

	// TODO lengthSquared?

	/**
	 *
	 * @description 求向量长度（模）的平方
	 * 几何意义：向量两分量构成的直角三角形斜边长的平方
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof Vector3
	 */
	lengthSq() {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	}


	/**
	 *
	 * @description 求向量长度（模）
	 * 几何意义：向量两分量构成的直角三角形斜边长
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof Vector3
	 */
	length() {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	}

	/**
	 *
	 * @description 三维向量的曼哈顿长度
	 * 几何意义： 三维向量在各坐标轴长度和
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof Vector3
	 */
	manhattanLength() {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	}

	/**
	 *
	 * @description 三维向量的单位化
	 * 几何意义：转换为长度为1，方向相同的向量
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof Vector3
	 */
	normalize() {

		return this.divideScalar( this.length() || 1 );

	}

	/**
	 *
	 * @description 按照参数l(长度)设置新的3维向量(x,y,z)值
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} length
	 * @return {*} 
	 * @memberof Vector3
	 */
	setLength( length ) {

		return this.normalize().multiplyScalar( length );

	}

	/**
	 *
	 * @description 当前3维向量(x,y,z)设置为下限和参数v(x,y,z)设为上限 之间进行线性插值
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @param {*} alpha
	 * @return {*} 
	 * @memberof Vector3
	 */
	lerp( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;

		return this;

	}

	lerpVectors( v1, v2, alpha ) {

		this.x = v1.x + ( v2.x - v1.x ) * alpha;
		this.y = v1.y + ( v2.y - v1.y ) * alpha;
		this.z = v1.z + ( v2.z - v1.z ) * alpha;

		return this;

	}

	/**
	 *
	 * @description 3维向量的叉乘
	 * 几何意义： 方向垂直与原连个向量，长度等于两个向量大小和sin0的值
	 * 二维上是两个向量构成的平行四边形面积（长宽）
	 * 三维上是两个向量构成的平行六面体的体积（长宽高）
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @param {*} w
	 * @return {*} 
	 * @memberof Vector3
	 */
	cross( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
			return this.crossVectors( v, w );

		}

		return this.crossVectors( this, v );

	}

	crossVectors( a, b ) {

		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

		return this;

	}

	/**
	 *
	 * @description 将当前3维向量(x,y,z)投影一个向量到另一个向量,参数vector(x,y,z)
	 * 几何意义： 向量投影的向量， v' = n*dot(v,n) / (mod(n))* (mod(n)) ,n 为单位向量的话，(mod(n))* (mod(n))=1
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @return {*} 
	 * @memberof Vector3
	 */
	projectOnVector( v ) {

		const denominator = v.lengthSq();

		if ( denominator === 0 ) return this.set( 0, 0, 0 );

		const scalar = v.dot( this ) / denominator;

		//投影一个向量到另一个向量
		return this.copy( v ).multiplyScalar( scalar );

	}

	/**
	 *
	 * @description 将当前3维向量(x,y,z)投影一个向量到一个平面(用一个向量表示,参数planeNormal(x,y,z)),然后当前向量减去
	 * 几何意义：从这个向量到这个向量到平面法线的投影
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} planeNormal
	 * @return {*} 
	 * @memberof Vector3
	 */
	projectOnPlane( planeNormal ) {

		_vector.copy( this ).projectOnVector( planeNormal );

		return this.sub( _vector );

	}

	/**
	 *
	 * @description 沿着法线(参数normal)反射向量
	 * reflect方法其实就是对一个向量进行镜像
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} normal
	 * @return {*} 
	 * @memberof Vector3
	 */
	reflect( normal ) {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		return this.sub( _vector.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

	}

	/**
	 *
	 * @description 当前向量与另一个向量的夹角
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @return {*} 
	 * @memberof Vector3
	 */
	angleTo( v ) {

		const denominator = Math.sqrt( this.lengthSq() * v.lengthSq() );

		if ( denominator === 0 ) return Math.PI / 2;

		const theta = this.dot( v ) / denominator;

		// clamp, to handle numerical problems

		return Math.acos( MathUtils.clamp( theta, - 1, 1 ) );

	}

	/**
	 *
	 * @description 当前3维向量到参数向量v的距离
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @return {*} 
	 * @memberof Vector3
	 */
	distanceTo( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}

	/**
	 *
	 * @description 当前3维向量到参数向量v的距离平方
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @return {*} 
	 * @memberof Vector3
	 */
	distanceToSquared( v ) {

		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

		return dx * dx + dy * dy + dz * dz;

	}

	manhattanDistanceTo( v ) {

		return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y ) + Math.abs( this.z - v.z );

	}

	setFromSpherical( s ) {

		return this.setFromSphericalCoords( s.radius, s.phi, s.theta );

	}

	setFromSphericalCoords( radius, phi, theta ) {

		const sinPhiRadius = Math.sin( phi ) * radius;

		this.x = sinPhiRadius * Math.sin( theta );
		this.y = Math.cos( phi ) * radius;
		this.z = sinPhiRadius * Math.cos( theta );

		return this;

	}

	setFromCylindrical( c ) {

		return this.setFromCylindricalCoords( c.radius, c.theta, c.y );

	}

	setFromCylindricalCoords( radius, theta, y ) {

		this.x = radius * Math.sin( theta );
		this.y = y;
		this.z = radius * Math.cos( theta );

		return this;

	}

	/**
	 *
	 * @description 从矩阵中的元素获得位移
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} m
	 * @return {*} 
	 * @memberof Vector3
	 */
	setFromMatrixPosition( m ) {

		const e = m.elements;

		this.x = e[ 12 ];
		this.y = e[ 13 ];
		this.z = e[ 14 ];

		return this;

	}

	/**
	 *
	 * @description 从矩阵中的元素获得缩放
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} m
	 * @return {*} 
	 * @memberof Vector3
	 */
	setFromMatrixScale( m ) {

		const sx = this.setFromMatrixColumn( m, 0 ).length();
		const sy = this.setFromMatrixColumn( m, 1 ).length();
		const sz = this.setFromMatrixColumn( m, 2 ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;

	}

	/**
	 *
	 * @description 从矩阵中的元素获得列主序向量
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} m
	 * @param {*} index
	 * @return {*} 
	 * @memberof Vector3
	 */
	setFromMatrixColumn( m, index ) {

		return this.fromArray( m.elements, index * 4 );

	}

	/**
	 *
	 * @description 从3阶矩阵中的元素获得列主序向量
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} m
	 * @param {*} index
	 * @return {*} 
	 * @memberof Vector3
	 */
	setFromMatrix3Column( m, index ) {

		return this.fromArray( m.elements, index * 3 );

	}

	/**
	 *
	 * @description 判断向量是否相等
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} v
	 * @return {*} 
	 * @memberof Vector3
	 */
	equals( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	}

	/**
	 *
	 * @description 从数组生成3维向量
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} array
	 * @param {number} [offset=0]
	 * @return {*} 
	 * @memberof Vector3
	 */
	fromArray( array, offset = 0 ) {

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	}

	/**
	 * 
	 * @description 从3维向量生成数组
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} [array=[]]
	 * @param {number} [offset=0]
	 * @return {*} 
	 * @memberof Vector3
	 */
	toArray( array = [], offset = 0 ) {

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array;

	}

	fromBufferAttribute( attribute, index, offset ) {

		if ( offset !== undefined ) {

			console.warn( 'THREE.Vector3: offset has been removed from .fromBufferAttribute().' );

		}

		this.x = attribute.getX( index );
		this.y = attribute.getY( index );
		this.z = attribute.getZ( index );

		return this;

	}

	/**
	 *
	 * 随机
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof Vector3
	 */
	random() {

		this.x = Math.random();
		this.y = Math.random();
		this.z = Math.random();

		return this;

	}

	/**
	 *
	 * @description 随机方向
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof Vector3
	 */
	randomDirection() {

		// Derived from https://mathworld.wolfram.com/SpherePointPicking.html

		const u = ( Math.random() - 0.5 ) * 2;
		const t = Math.random() * Math.PI * 2;
		const f = Math.sqrt( 1 - u ** 2 );

		this.x = f * Math.cos( t );
		this.y = f * Math.sin( t );
		this.z = u;

		return this;

	}

	*[ Symbol.iterator ]() {

		yield this.x;
		yield this.y;
		yield this.z;

	}

}

Vector3.prototype.isVector3 = true;

const _vector = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();

export { Vector3 };
