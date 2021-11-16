// https://github.com/omni360/ThreeJS-Notes/blob/master/core/Object3D.js

import { Quaternion } from '../math/Quaternion.js';
import { Vector3 } from '../math/Vector3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { EventDispatcher } from './EventDispatcher.js';
import { Euler } from '../math/Euler.js';
import { Layers } from './Layers.js';
import { Matrix3 } from '../math/Matrix3.js';
import * as MathUtils from '../math/MathUtils.js';

let _object3DId = 0;

const _v1 = /*@__PURE__*/ new Vector3();
const _q1 = /*@__PURE__*/ new Quaternion();
const _m1 = /*@__PURE__*/ new Matrix4();
const _target = /*@__PURE__*/ new Vector3();

const _position = /*@__PURE__*/ new Vector3();
const _scale = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();

const _xAxis = /*@__PURE__*/ new Vector3( 1, 0, 0 );
const _yAxis = /*@__PURE__*/ new Vector3( 0, 1, 0 );
const _zAxis = /*@__PURE__*/ new Vector3( 0, 0, 1 );

const _addedEvent = { type: 'added' };
const _removedEvent = { type: 'removed' };

class Object3D extends EventDispatcher {

	constructor() {

		super();

		Object.defineProperty( this, 'id', { value: _object3DId ++ } );

		this.uuid = MathUtils.generateUUID();

		// 对象名称
		this.name = '';

		// 对象类型
		this.type = 'Object3D';

		// 对象的父级
		this.parent = null;

		// 对象的子级
		this.children = [];

		// 对象的上方向
		this.up = Object3D.DefaultUp.clone();

		// 位置
		const position = new Vector3();

		// 旋转
		const rotation = new Euler();

		// 四元数
		const quaternion = new Quaternion();

		// 比例
		const scale = new Vector3( 1, 1, 1 );

		// 给对象的rotation属性绑定setFromEuler()方法
		// 当rotation属性值更改,调用setFromEuler()方法
		function onRotationChange() {

			quaternion.setFromEuler( rotation, false );

		}

		// 给对象的rotation属性绑定setFromQuaternion()方法
		// 当rotation属性值更改,调用setFromQuaternion()方法
		function onQuaternionChange() {

			rotation.setFromQuaternion( quaternion, undefined, false );

		}

		rotation._onChange( onRotationChange );
		quaternion._onChange( onQuaternionChange );

		Object.defineProperties( this, {
			position: {
				configurable: true,
				enumerable: true,
				value: position
			},
			rotation: {
				configurable: true,
				enumerable: true,
				value: rotation
			},
			quaternion: {
				configurable: true,
				enumerable: true,
				value: quaternion
			},
			scale: {
				configurable: true,
				enumerable: true,
				value: scale
			},
			modelViewMatrix: {
				// 视图矩阵
				value: new Matrix4()
			},
			normalMatrix: {
				// 普通矩阵（3阶矩阵）
				value: new Matrix3()
			}
		} );

		// 对象的变换矩阵
		this.matrix = new Matrix4();

		// 对象的世界矩阵
		this.matrixWorld = new Matrix4();

		// 是否需要自动更新
		this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;

		// 世界矩阵是否需要更新
		this.matrixWorldNeedsUpdate = false;

		// 层级
		this.layers = new Layers();

		// 是否可见
		this.visible = true;

		// 是否生成阴影
		this.castShadow = false;

		// 是否支持阴影覆盖
		this.receiveShadow = false;

		// 是否需要平头界面体裁剪
		this.frustumCulled = true;

		// 渲染的顺序
		this.renderOrder = 0;

		// 运动列表
		this.animations = [];

		// 用户自定义数据
		this.userData = {};

	}

	// 提供生命周期——渲染前
	onBeforeRender( /* renderer, scene, camera, geometry, material, group */ ) {}

	// 提供生命周期——渲染后
	onAfterRender( /* renderer, scene, camera, geometry, material, group */ ) {}

	// 应用4阶矩阵
	applyMatrix4( matrix ) {

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		this.matrix.premultiply( matrix );

		// 分解位置，旋转，缩放
		this.matrix.decompose( this.position, this.quaternion, this.scale );

	}

	// 应用四元数
	applyQuaternion( q ) {

		this.quaternion.premultiply( q );

		return this;

	}

	// 通过四元数的方式旋转任意坐标轴(参数axis)旋转角度(参数angle),
	// 最后将结果返回到this.quternion属性中
	setRotationFromAxisAngle( axis, angle ) {

		// assumes axis is normalized

		this.quaternion.setFromAxisAngle( axis, angle );

	}

	// 通过一次欧拉旋转(参数euler)设置四元数旋转,
	// 最后将结果返回到this.quternion属性中
	setRotationFromEuler( euler ) {

		this.quaternion.setFromEuler( euler, true );

	}

	// 利用一个参数m(旋转矩阵),达到旋转变换的目的吧,
	// 最后将结果返回到this.quternion属性中
	setRotationFromMatrix( m ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		this.quaternion.setFromRotationMatrix( m );

	}

	// 通过规范化的旋转四元数直接应用旋转
	setRotationFromQuaternion( q ) {

		// assumes q is normalized

		this.quaternion.copy( q );

	}

	/**
	 * @description 通过坐标轴旋转
	 * @param {THREE.Vector3} axis 
	 * @param {float} angle 弧度
	 * @return {Object3D} 
	 * @memberof Object3D
	 */
	rotateOnAxis( axis, angle ) {

		// rotate object on axis in object space
		// axis is assumed to be normalized

		_q1.setFromAxisAngle( axis, angle );

		this.quaternion.multiply( _q1 );

		return this;

	}

	rotateOnWorldAxis( axis, angle ) {

		// rotate object on axis in world space
		// axis is assumed to be normalized
		// method assumes no rotated parent

		_q1.setFromAxisAngle( axis, angle );

		this.quaternion.premultiply( _q1 );

		return this;

	}

	/**
	 *
	 * @description 绕X轴旋转angle度
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} angle
	 * @return {*} 
	 * @memberof Object3D
	 */
	rotateX( angle ) {

		return this.rotateOnAxis( _xAxis, angle );

	}

	/**
	 *
	 * @description  绕Y轴旋转angle度
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} angle
	 * @return {*} 
	 * @memberof Object3D
	 */
	rotateY( angle ) {

		return this.rotateOnAxis( _yAxis, angle );

	}

	/**
	 *
	 * @description 绕Z轴旋转angle度
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} angle
	 * @return {*} 
	 * @memberof Object3D
	 */
	rotateZ( angle ) {

		return this.rotateOnAxis( _zAxis, angle );

	}


	/**
	 *
	 * @description 对象延任意坐标轴(参数axis)移动指定距离(参数distance)
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} axis
	 * @param {*} distance
	 * @return {*} 
	 * @memberof Object3D
	 */
	translateOnAxis( axis, distance ) {

		// translate object by distance along axis in object space
		// axis is assumed to be normalized

		_v1.copy( axis ).applyQuaternion( this.quaternion );

		this.position.add( _v1.multiplyScalar( distance ) );

		return this;

	}


	/**
	 *
	 * @description 对象延X轴移动指定距离(参数distance)
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} distance
	 * @return {*} 
	 * @memberof Object3D
	 */
	translateX( distance ) {

		return this.translateOnAxis( _xAxis, distance );

	}


	/**
	 *
	 * @description  对象延Y轴移动指定距离(参数distance)
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} distance
	 * @return {*} 
	 * @memberof Object3D
	 */
	translateY( distance ) {

		return this.translateOnAxis( _yAxis, distance );

	}

	 
	/**
	 *
	 * @description 对象延Z轴移动指定距离(参数distance)
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} distance
	 * @return {*} 
	 * @memberof Object3D
	 */
	translateZ( distance ) {

		return this.translateOnAxis( _zAxis, distance );

	}


	/**
	 *
	 * @description 将参数vector,从模型坐标系变换成世界坐标系
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} vector
	 * @return {*} 
	 * @memberof Object3D
	 */
	localToWorld( vector ) {

		return vector.applyMatrix4( this.matrixWorld );

	}


	/**
	 *
	 * @description 将参数vector,从世界坐标系变换成模型坐标系
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} vector
	 * @return {*} 
	 * @memberof Object3D
	 */
	worldToLocal( vector ) {

		return vector.applyMatrix4( _m1.copy( this.matrixWorld ).invert() );

	}


	/**
	 *
	 * @description 用来旋转对象,并将对象面对空间中的点vector
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} x
	 * @param {*} y
	 * @param {*} z
	 * @memberof Object3D
	 */
	lookAt( x, y, z ) {

		// This method does not support objects having non-uniformly-scaled parent(s)

		if ( x.isVector3 ) {

			_target.copy( x );

		} else {

			_target.set( x, y, z );

		}

		const parent = this.parent;

		this.updateWorldMatrix( true, false );

		_position.setFromMatrixPosition( this.matrixWorld );

		if ( this.isCamera || this.isLight ) {

			_m1.lookAt( _position, _target, this.up );

		} else {

			_m1.lookAt( _target, _position, this.up );

		}

		this.quaternion.setFromRotationMatrix( _m1 );

		if ( parent ) {

			_m1.extractRotation( parent.matrixWorld );
			_q1.setFromRotationMatrix( _m1 );
			this.quaternion.premultiply( _q1.invert() );

		}

	}


	/**
	 *
	 * @description 对象(参数object),设置为当前对象的子对象
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} object
	 * @return {*} 
	 * @memberof Object3D
	 */
	add( object ) {

		if ( arguments.length > 1 ) {

			for ( let i = 0; i < arguments.length; i ++ ) {

				this.add( arguments[ i ] );

			}

			return this;

		}

		if ( object === this ) {

			console.error( 'THREE.Object3D.add: object can\'t be added as a child of itself.', object );
			return this;

		}

		if ( object && object.isObject3D ) {

			if ( object.parent !== null ) {

				object.parent.remove( object );

			}

			object.parent = this;
			this.children.push( object );

			object.dispatchEvent( _addedEvent );

		} else {

			console.error( 'THREE.Object3D.add: object not an instance of THREE.Object3D.', object );

		}

		return this;

	}


	/**
	 *
	 * @description 对象(参数object),从当前对象的子对象列表中删除
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} object
	 * @return {*} 
	 * @memberof Object3D
	 */
	remove( object ) {

		if ( arguments.length > 1 ) {

			for ( let i = 0; i < arguments.length; i ++ ) {

				this.remove( arguments[ i ] );

			}

			return this;

		}

		const index = this.children.indexOf( object );

		if ( index !== - 1 ) {

			object.parent = null;
			this.children.splice( index, 1 );

			object.dispatchEvent( _removedEvent );

		}

		return this;

	}

	/**
	 *
	 * @description 从父级中移除
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof Object3D
	 */
	removeFromParent() {

		const parent = this.parent;

		if ( parent !== null ) {

			parent.remove( this );

		}

		return this;

	}


	/**
	 *
	 * @description 清空子级
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof Object3D
	 */
	clear() {

		for ( let i = 0; i < this.children.length; i ++ ) {

			const object = this.children[ i ];

			object.parent = null;

			object.dispatchEvent( _removedEvent );

		}

		this.children.length = 0;

		return this;


	}

	attach( object ) {

		// adds object as a child of this, while maintaining the object's world transform

		// Note: This method does not support scene graphs having non-uniformly-scaled nodes(s)

		this.updateWorldMatrix( true, false );

		_m1.copy( this.matrixWorld ).invert();

		if ( object.parent !== null ) {

			object.parent.updateWorldMatrix( true, false );

			_m1.multiply( object.parent.matrixWorld );

		}

		object.applyMatrix4( _m1 );

		this.add( object );

		object.updateWorldMatrix( false, true );

		return this;

	}

	/**
	 *
	 * @description 通过id获得子对象
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} id
	 * @return {*} 
	 * @memberof Object3D
	 */
	getObjectById( id ) {

		return this.getObjectByProperty( 'id', id );

	}

	/**
	 *
	 * @description 通过name获得子对象
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} name
	 * @return {*} 
	 * @memberof Object3D
	 */
	getObjectByName( name ) {

		return this.getObjectByProperty( 'name', name );

	}

	/**
	 *
	 * @description 获取子对象的属性
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} name
	 * @param {*} value
	 * @return {*} 
	 * @memberof Object3D
	 */
	getObjectByProperty( name, value ) {

		if ( this[ name ] === value ) return this;

		for ( let i = 0, l = this.children.length; i < l; i ++ ) {

			const child = this.children[ i ];
			const object = child.getObjectByProperty( name, value );

			if ( object !== undefined ) {

				return object;

			}

		}

		return undefined;

	}

	/**
	 *
	 * @description 获得世界坐标系下的平移坐标
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} target
	 * @return {*} 
	 * @memberof Object3D
	 */
	getWorldPosition( target ) {

		this.updateWorldMatrix( true, false );

		return target.setFromMatrixPosition( this.matrixWorld );

	}

	/**
	 *
	 * @description 获得世界坐标系下的四元数
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} target
	 * @return {*} 
	 * @memberof Object3D
	 */
	getWorldQuaternion( target ) {

		this.updateWorldMatrix( true, false );

		this.matrixWorld.decompose( _position, target, _scale );

		return target;

	}


	/**
	 *
	 * @description 获得世界坐标系下的缩放向量
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} target
	 * @return {*} 
	 * @memberof Object3D
	 */
	getWorldScale( target ) {

		this.updateWorldMatrix( true, false );

		this.matrixWorld.decompose( _position, _quaternion, target );

		return target;

	}

	/**
	 *
	 * @description 获取世界坐标系下的方向
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} target
	 * @return {*} 
	 * @memberof Object3D
	 */
	getWorldDirection( target ) {

		this.updateWorldMatrix( true, false );

		const e = this.matrixWorld.elements;

		return target.set( e[ 8 ], e[ 9 ], e[ 10 ] ).normalize();

	}

	raycast() {}


	/**
	 *
	 * @description 遍历当前对象以及子对象并且应用callback方法
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} callback
	 * @memberof Object3D
	 */
	traverse( callback ) {

		callback( this );

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverse( callback );

		}

	}

	/**
	 *
	 * @description 遍历当前对象以及子对象，当对象可见时并且应用callback方法
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} callback
	 * @return {*} 
	 * @memberof Object3D
	 */
	traverseVisible( callback ) {

		if ( this.visible === false ) return;

		callback( this );

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].traverseVisible( callback );

		}

	}

	/**
	 *
	 * @description 遍历当前对象父级，并且应用callback方法
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} callback
	 * @memberof Object3D
	 */
	traverseAncestors( callback ) {

		const parent = this.parent;

		if ( parent !== null ) {

			callback( parent );

			parent.traverseAncestors( callback );

		}

	}

	/**
	 *
	 * @description  根据 位置，四元数，缩放比例 更新矩阵，并设置世界矩阵需要更新
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @memberof Object3D
	 */
	updateMatrix() {

		this.matrix.compose( this.position, this.quaternion, this.scale );

		this.matrixWorldNeedsUpdate = true;

	}


	/**
	 *
	 * @description 根据 位置，四元数，缩放比例 更新世界坐标系下的矩阵
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} force 是否强制更新
	 * @memberof Object3D
	 */
	updateMatrixWorld( force ) {

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		if ( this.matrixWorldNeedsUpdate || force ) {

			if ( this.parent === null ) {

				this.matrixWorld.copy( this.matrix );

			} else {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

			}

			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].updateMatrixWorld( force );

		}

	}


	/**
	 *
	 * @description 根据 位置，四元数，缩放比例 更新世界矩阵
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} updateParents
	 * @param {*} updateChildren
	 * @memberof Object3D
	 */
	updateWorldMatrix( updateParents, updateChildren ) {

		const parent = this.parent;

		if ( updateParents === true && parent !== null ) {

			parent.updateWorldMatrix( true, false );

		}

		if ( this.matrixAutoUpdate ) this.updateMatrix();

		if ( this.parent === null ) {

			this.matrixWorld.copy( this.matrix );

		} else {

			this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

		}

		// update children

		if ( updateChildren === true ) {

			const children = this.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				children[ i ].updateWorldMatrix( false, true );

			}

		}

	}

	/**
	 *
	 * @description Object3D存为JSON格式
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} meta
	 * @return {*} 
	 * @memberof Object3D
	 */
	toJSON( meta ) {

		// meta is a string when called from JSON.stringify
		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		const output = {};

		// meta is a hash used to collect geometries, materials.
		// not providing it implies that this is the root object
		// being serialized.
		if ( isRootObject ) {

			// initialize meta obj
			meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {},
				shapes: {},
				skeletons: {},
				animations: {}
			};

			output.metadata = {
				version: 4.5,
				type: 'Object',
				generator: 'Object3D.toJSON'
			};

		}

		// standard Object3D serialization

		const object = {};

		object.uuid = this.uuid;
		object.type = this.type;

		if ( this.name !== '' ) object.name = this.name;
		if ( this.castShadow === true ) object.castShadow = true;
		if ( this.receiveShadow === true ) object.receiveShadow = true;
		if ( this.visible === false ) object.visible = false;
		if ( this.frustumCulled === false ) object.frustumCulled = false;
		if ( this.renderOrder !== 0 ) object.renderOrder = this.renderOrder;
		if ( JSON.stringify( this.userData ) !== '{}' ) object.userData = this.userData;

		object.layers = this.layers.mask;
		object.matrix = this.matrix.toArray();

		if ( this.matrixAutoUpdate === false ) object.matrixAutoUpdate = false;

		// object specific properties

		if ( this.isInstancedMesh ) {

			object.type = 'InstancedMesh';
			object.count = this.count;
			object.instanceMatrix = this.instanceMatrix.toJSON();
			if ( this.instanceColor !== null ) object.instanceColor = this.instanceColor.toJSON();

		}

		//

		function serialize( library, element ) {

			if ( library[ element.uuid ] === undefined ) {

				library[ element.uuid ] = element.toJSON( meta );

			}

			return element.uuid;

		}

		if ( this.isScene ) {

			if ( this.background ) {

				if ( this.background.isColor ) {

					object.background = this.background.toJSON();

				} else if ( this.background.isTexture ) {

					object.background = this.background.toJSON( meta ).uuid;

				}

			}

			if ( this.environment && this.environment.isTexture ) {

				object.environment = this.environment.toJSON( meta ).uuid;

			}

		} else if ( this.isMesh || this.isLine || this.isPoints ) {

			object.geometry = serialize( meta.geometries, this.geometry );

			const parameters = this.geometry.parameters;

			if ( parameters !== undefined && parameters.shapes !== undefined ) {

				const shapes = parameters.shapes;

				if ( Array.isArray( shapes ) ) {

					for ( let i = 0, l = shapes.length; i < l; i ++ ) {

						const shape = shapes[ i ];

						serialize( meta.shapes, shape );

					}

				} else {

					serialize( meta.shapes, shapes );

				}

			}

		}

		if ( this.isSkinnedMesh ) {

			object.bindMode = this.bindMode;
			object.bindMatrix = this.bindMatrix.toArray();

			if ( this.skeleton !== undefined ) {

				serialize( meta.skeletons, this.skeleton );

				object.skeleton = this.skeleton.uuid;

			}

		}

		if ( this.material !== undefined ) {

			if ( Array.isArray( this.material ) ) {

				const uuids = [];

				for ( let i = 0, l = this.material.length; i < l; i ++ ) {

					uuids.push( serialize( meta.materials, this.material[ i ] ) );

				}

				object.material = uuids;

			} else {

				object.material = serialize( meta.materials, this.material );

			}

		}

		//

		if ( this.children.length > 0 ) {

			object.children = [];

			for ( let i = 0; i < this.children.length; i ++ ) {

				object.children.push( this.children[ i ].toJSON( meta ).object );

			}

		}

		//

		if ( this.animations.length > 0 ) {

			object.animations = [];

			for ( let i = 0; i < this.animations.length; i ++ ) {

				const animation = this.animations[ i ];

				object.animations.push( serialize( meta.animations, animation ) );

			}

		}

		if ( isRootObject ) {

			const geometries = extractFromCache( meta.geometries );
			const materials = extractFromCache( meta.materials );
			const textures = extractFromCache( meta.textures );
			const images = extractFromCache( meta.images );
			const shapes = extractFromCache( meta.shapes );
			const skeletons = extractFromCache( meta.skeletons );
			const animations = extractFromCache( meta.animations );

			if ( geometries.length > 0 ) output.geometries = geometries;
			if ( materials.length > 0 ) output.materials = materials;
			if ( textures.length > 0 ) output.textures = textures;
			if ( images.length > 0 ) output.images = images;
			if ( shapes.length > 0 ) output.shapes = shapes;
			if ( skeletons.length > 0 ) output.skeletons = skeletons;
			if ( animations.length > 0 ) output.animations = animations;

		}

		output.object = object;

		return output;

		// extract data from the cache hash
		// remove metadata on each item
		// and return as array
		function extractFromCache( cache ) {

			const values = [];
			for ( const key in cache ) {

				const data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

	}


	/**
	 *
	 * @description 克隆Object3D
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} recursive true,克隆其子对象,否则只克隆当前对象
	 * @return {*} 
	 * @memberof Object3D
	 */
	clone( recursive ) {

		return new this.constructor().copy( this, recursive );

	}

	copy( source, recursive = true ) {

		this.name = source.name;

		this.up.copy( source.up );

		this.position.copy( source.position );
		this.rotation.order = source.rotation.order;
		this.quaternion.copy( source.quaternion );
		this.scale.copy( source.scale );

		this.matrix.copy( source.matrix );
		this.matrixWorld.copy( source.matrixWorld );

		this.matrixAutoUpdate = source.matrixAutoUpdate;
		this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

		this.layers.mask = source.layers.mask;
		this.visible = source.visible;

		this.castShadow = source.castShadow;
		this.receiveShadow = source.receiveShadow;

		this.frustumCulled = source.frustumCulled;
		this.renderOrder = source.renderOrder;

		this.userData = JSON.parse( JSON.stringify( source.userData ) );

		if ( recursive === true ) {

			for ( let i = 0; i < source.children.length; i ++ ) {

				const child = source.children[ i ];
				this.add( child.clone() );

			}

		}

		return this;

	}

}

Object3D.DefaultUp = new Vector3( 0, 1, 0 );
Object3D.DefaultMatrixAutoUpdate = true;

Object3D.prototype.isObject3D = true;

export { Object3D };
