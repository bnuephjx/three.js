import { Vector3 } from '../math/Vector3.js';
import { Vector2 } from '../math/Vector2.js';
import { Box3 } from '../math/Box3.js';
import { EventDispatcher } from './EventDispatcher.js';
import { BufferAttribute, Float32BufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute } from './BufferAttribute.js';
import { Sphere } from '../math/Sphere.js';
import { Object3D } from './Object3D.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Matrix3 } from '../math/Matrix3.js';
import * as MathUtils from '../math/MathUtils.js';
import { arrayMax } from '../utils.js';

let _id = 0;

const _m1 = /*@__PURE__*/ new Matrix4();
const _obj = /*@__PURE__*/ new Object3D();
const _offset = /*@__PURE__*/ new Vector3();
const _box = /*@__PURE__*/ new Box3();
const _boxMorphTargets = /*@__PURE__*/ new Box3();
const _vector = /*@__PURE__*/ new Vector3();

/**
 *
 * @description 将所有的数据包括顶点位置,法线,面,颜色,uv和其它的自定义属性存在缓冲区
 * 这样可以减少GPU的负荷,BufferGeometry同样也比Geometry对象复杂,增加了使用的难度,这里的属性都是存放在数组中
 * 比如顶点位置不是Vector3对象,颜色也不是color对象,而是数组.需要访问这些属性,需要从属性缓冲区中读原始数据
 * 根据BufferGeometry类特性,我们在创建一些静态对象,实例化后不经常操作的对象时,选择这个类
 * 读取或编辑 BufferGeometry 中的数据，见 BufferAttribute 文档。
 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
 * @class BufferGeometry
 * @extends {EventDispatcher}
 */
class BufferGeometry extends EventDispatcher {

	constructor() {

		super();

		Object.defineProperty( this, 'id', { value: _id ++ } );

		// BufferGeometry对象的UUID
		this.uuid = MathUtils.generateUUID();

		// 对象名称
		this.name = '';

		// 对象类型
		this.type = 'BufferGeometry';

		// 允许顶点在多个三角面片间可以重用。
		this.index = null;

		// 对象属性列表
		// 可以通过 .setAttribute 和 .getAttribute 添加和访问与当前几何体有关的 attribute
		this.attributes = {};

		// 存储 BufferAttribute 的 Hashmap，存储了几何体 morph targets 的细节信息。
		this.morphAttributes = {};
		this.morphTargetsRelative = false;

		// 将当前几何体分割成组进行渲染，每个部分都会在单独的 WebGL 的 draw call 中进行绘制。
		// 该方法可以让当前的 bufferGeometry 可以使用一个材质队列进行描述。
		this.groups = [];

		// 当前 bufferGeometry 的外边界矩形
		this.boundingBox = null;

		// 当前 bufferGeometry 的外边界球形。 
		this.boundingSphere = null;

		// 用于判断几何体的哪个部分需要被渲染。
		// 该值不应该直接被设置，而需要通过 .setDrawRange 进行设置。
		this.drawRange = { start: 0, count: Infinity };

		// 存储 BufferGeometry 的自定义数据的对象。
		// 为保持对象在克隆时完整，该对象不应该包括任何函数的引用。
		this.userData = {};

	}

	/**
	 *
	 * @description 返回缓存相关的 .index。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	getIndex() {

		return this.index;

	}

	/**
	 *
	 * @description 设置缓存的 .index。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} index
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	setIndex( index ) {

		if ( Array.isArray( index ) ) {

			this.index = new ( arrayMax( index ) > 65535 ? Uint32BufferAttribute : Uint16BufferAttribute )( index, 1 );

		} else {

			this.index = index;

		}

		return this;

	}

	/**
	 *
	 * @description 返回指定名称的 attribute。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} name
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	getAttribute( name ) {

		return this.attributes[ name ];

	}

	/**
	 *
	 * @description 为当前几何体设置一个 attribute 属性。
	 * 在类的内部，有一个存储 .attributes 的 hashmap， 通过该 hashmap，遍历 attributes 的速度会更快。
	 * 而使用该方法，可以向 hashmap 内部增加 attribute。 
	 * 所以，你需要使用该方法来添加 attributes。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} name
	 * @param {*} attribute
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	setAttribute( name, attribute ) {

		this.attributes[ name ] = attribute;

		return this;

	}

	/**
	 *
	 * @description 删除具有指定名称的 attribute。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} name
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	deleteAttribute( name ) {

		delete this.attributes[ name ];

		return this;

	}

	/**
	 *
	 * @description 判断是否有这个属性
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} name
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	hasAttribute( name ) {

		return this.attributes[ name ] !== undefined;

	}

	/**
	 *
	 * @description 为当前几何体增加一个 group，详见 groups 属性
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} start
	 * @param {*} count
	 * @param {number} [materialIndex=0]
	 * @memberof BufferGeometry
	 */
	addGroup( start, count, materialIndex = 0 ) {

		this.groups.push( {

			start: start,
			count: count,
			materialIndex: materialIndex

		} );

	}

	/**
	 *
	 * @description 清空
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @memberof BufferGeometry
	 */
	clearGroups() {

		this.groups = [];

	}

	/**
	 *
	 * @description 设置缓存的 .drawRange。详见相关属性说明
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} start
	 * @param {*} count
	 * @memberof BufferGeometry
	 */
	setDrawRange( start, count ) {

		this.drawRange.start = start;
		this.drawRange.count = count;

	}

	/**
	 *
	 * @description 用给定矩阵转换几何体的顶点坐标。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} matrix
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	applyMatrix4( matrix ) {

		const position = this.attributes.position;

		if ( position !== undefined ) {

			position.applyMatrix4( matrix );

			position.needsUpdate = true;

		}

		const normal = this.attributes.normal;

		if ( normal !== undefined ) {

			const normalMatrix = new Matrix3().getNormalMatrix( matrix );

			normal.applyNormalMatrix( normalMatrix );

			normal.needsUpdate = true;

		}

		const tangent = this.attributes.tangent;

		if ( tangent !== undefined ) {

			tangent.transformDirection( matrix );

			tangent.needsUpdate = true;

		}

		if ( this.boundingBox !== null ) {

			this.computeBoundingBox();

		}

		if ( this.boundingSphere !== null ) {

			this.computeBoundingSphere();

		}

		return this;

	}

	/**
	 *
	 * @description 用给定四元数转换几何体的顶点坐标。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} q
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	applyQuaternion( q ) {

		_m1.makeRotationFromQuaternion( q );

		this.applyMatrix4( _m1 );

		return this;

	}

	/**
	 *
	 * @description 在 X 轴上旋转几何体。
	 * 该操作一般在一次处理中完成，不会循环处理。典型的用法是通过调用 Object3D.rotation 实时旋转几何体
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} angle
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	rotateX( angle ) {

		// rotate geometry around world x-axis

		_m1.makeRotationX( angle );

		this.applyMatrix4( _m1 );

		return this;

	}

	/**
	 *
	 * @description 在 Y 轴上旋转几何体。
	 * 该操作一般在一次处理中完成，不会循环处理。典型的用法是通过调用 Object3D.rotation 实时旋转几何体。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} angle
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	rotateY( angle ) {

		// rotate geometry around world y-axis

		_m1.makeRotationY( angle );

		this.applyMatrix4( _m1 );

		return this;

	}

	/**
	 *
	 * @description 在 Z 轴上旋转几何体。
	 * 该操作一般在一次处理中完成，不会循环处理。典型的用法是通过调用 Object3D.rotation 实时旋转几何体。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} angle
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	rotateZ( angle ) {

		// rotate geometry around world z-axis

		_m1.makeRotationZ( angle );

		this.applyMatrix4( _m1 );

		return this;

	}

	/**
	 *
	 * @description 移动几何体。
	 * 该操作一般在一次处理中完成，不会循环处理。典型的用法是通过调用 Object3D.rotation 实时旋转几何体。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} x
	 * @param {*} y
	 * @param {*} z
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	translate( x, y, z ) {

		// translate geometry

		_m1.makeTranslation( x, y, z );

		this.applyMatrix4( _m1 );

		return this;

	}

	/**
	 *
	 * @description 缩放几何体。
	 * 该操作一般在一次处理中完成，不会循环处理。典型的用法是通过调用 Object3D.scale 实时旋转几何体。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} x
	 * @param {*} y
	 * @param {*} z
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	scale( x, y, z ) {

		// scale geometry

		_m1.makeScale( x, y, z );

		this.applyMatrix4( _m1 );

		return this;

	}

	/**
	 *
	 * @description 旋转几何体朝向控件中的一点。
	 * 该过程通常在一次处理中完成，不会循环处理。典型的用法是过通过调用 Object3D.lookAt 实时改变 mesh 朝向。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} vector 几何体所朝向的世界坐标
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	lookAt( vector ) {

		_obj.lookAt( vector );

		_obj.updateMatrix();

		this.applyMatrix4( _obj.matrix );

		return this;

	}

	/**
	 *
	 * @description 根据边界矩形将几何体居中
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	center() {

		this.computeBoundingBox();

		this.boundingBox.getCenter( _offset ).negate();

		this.translate( _offset.x, _offset.y, _offset.z );

		return this;

	}

	/**
	 *
	 * @description 通过点队列设置该 BufferGeometry 的 attribute。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} points
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	setFromPoints( points ) {

		const position = [];

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			const point = points[ i ];
			position.push( point.x, point.y, point.z || 0 );

		}

		this.setAttribute( 'position', new Float32BufferAttribute( position, 3 ) );

		return this;

	}

	/**
	 *
	 * @description 计算当前几何体的的边界矩形，该操作会更新已有 [param:.boundingBox]。
	 * 边界矩形不会默认计算，需要调用该接口指定计算边界矩形，否则保持默认值 null。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	computeBoundingBox() {

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		const position = this.attributes.position;
		const morphAttributesPosition = this.morphAttributes.position;

		if ( position && position.isGLBufferAttribute ) {

			console.error( 'THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".', this );

			this.boundingBox.set(
				new Vector3( - Infinity, - Infinity, - Infinity ),
				new Vector3( + Infinity, + Infinity, + Infinity )
			);

			return;

		}

		if ( position !== undefined ) {

			this.boundingBox.setFromBufferAttribute( position );

			// process morph attributes if present

			if ( morphAttributesPosition ) {

				for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

					const morphAttribute = morphAttributesPosition[ i ];
					_box.setFromBufferAttribute( morphAttribute );

					if ( this.morphTargetsRelative ) {

						_vector.addVectors( this.boundingBox.min, _box.min );
						this.boundingBox.expandByPoint( _vector );

						_vector.addVectors( this.boundingBox.max, _box.max );
						this.boundingBox.expandByPoint( _vector );

					} else {

						this.boundingBox.expandByPoint( _box.min );
						this.boundingBox.expandByPoint( _box.max );

					}

				}

			}

		} else {

			this.boundingBox.makeEmpty();

		}

		if ( isNaN( this.boundingBox.min.x ) || isNaN( this.boundingBox.min.y ) || isNaN( this.boundingBox.min.z ) ) {

			console.error( 'THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this );

		}

	}

	/**
	 *
	 * @description 计算当前几何体的的边界球形，该操作会更新已有 [param:.boundingSphere]。
	 * 边界球形不会默认计算，需要调用该接口指定计算边界球形，否则保持默认值 null
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	computeBoundingSphere() {

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		const position = this.attributes.position;
		const morphAttributesPosition = this.morphAttributes.position;

		if ( position && position.isGLBufferAttribute ) {

			console.error( 'THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".', this );

			this.boundingSphere.set( new Vector3(), Infinity );

			return;

		}

		if ( position ) {

			// first, find the center of the bounding sphere

			const center = this.boundingSphere.center;

			_box.setFromBufferAttribute( position );

			// process morph attributes if present

			if ( morphAttributesPosition ) {

				for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

					const morphAttribute = morphAttributesPosition[ i ];
					_boxMorphTargets.setFromBufferAttribute( morphAttribute );

					if ( this.morphTargetsRelative ) {

						_vector.addVectors( _box.min, _boxMorphTargets.min );
						_box.expandByPoint( _vector );

						_vector.addVectors( _box.max, _boxMorphTargets.max );
						_box.expandByPoint( _vector );

					} else {

						_box.expandByPoint( _boxMorphTargets.min );
						_box.expandByPoint( _boxMorphTargets.max );

					}

				}

			}

			_box.getCenter( center );

			// second, try to find a boundingSphere with a radius smaller than the
			// boundingSphere of the boundingBox: sqrt(3) smaller in the best case

			let maxRadiusSq = 0;

			for ( let i = 0, il = position.count; i < il; i ++ ) {

				_vector.fromBufferAttribute( position, i );

				maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _vector ) );

			}

			// process morph attributes if present

			if ( morphAttributesPosition ) {

				for ( let i = 0, il = morphAttributesPosition.length; i < il; i ++ ) {

					const morphAttribute = morphAttributesPosition[ i ];
					const morphTargetsRelative = this.morphTargetsRelative;

					for ( let j = 0, jl = morphAttribute.count; j < jl; j ++ ) {

						_vector.fromBufferAttribute( morphAttribute, j );

						if ( morphTargetsRelative ) {

							_offset.fromBufferAttribute( position, j );
							_vector.add( _offset );

						}

						maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _vector ) );

					}

				}

			}

			this.boundingSphere.radius = Math.sqrt( maxRadiusSq );

			if ( isNaN( this.boundingSphere.radius ) ) {

				console.error( 'THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this );

			}

		}

	}

	/**
	 *
	 * @description 计算并将切线属性添加到此几何体
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	computeTangents() {

		const index = this.index;
		const attributes = this.attributes;

		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)

		if ( index === null ||
			 attributes.position === undefined ||
			 attributes.normal === undefined ||
			 attributes.uv === undefined ) {

			console.error( 'THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)' );
			return;

		}

		const indices = index.array;
		const positions = attributes.position.array;
		const normals = attributes.normal.array;
		const uvs = attributes.uv.array;

		const nVertices = positions.length / 3;

		if ( attributes.tangent === undefined ) {

			this.setAttribute( 'tangent', new BufferAttribute( new Float32Array( 4 * nVertices ), 4 ) );

		}

		const tangents = attributes.tangent.array;

		const tan1 = [], tan2 = [];

		for ( let i = 0; i < nVertices; i ++ ) {

			tan1[ i ] = new Vector3();
			tan2[ i ] = new Vector3();

		}

		const vA = new Vector3(),
			vB = new Vector3(),
			vC = new Vector3(),

			uvA = new Vector2(),
			uvB = new Vector2(),
			uvC = new Vector2(),

			sdir = new Vector3(),
			tdir = new Vector3();

		function handleTriangle( a, b, c ) {

			vA.fromArray( positions, a * 3 );
			vB.fromArray( positions, b * 3 );
			vC.fromArray( positions, c * 3 );

			uvA.fromArray( uvs, a * 2 );
			uvB.fromArray( uvs, b * 2 );
			uvC.fromArray( uvs, c * 2 );

			vB.sub( vA );
			vC.sub( vA );

			uvB.sub( uvA );
			uvC.sub( uvA );

			const r = 1.0 / ( uvB.x * uvC.y - uvC.x * uvB.y );

			// silently ignore degenerate uv triangles having coincident or colinear vertices

			if ( ! isFinite( r ) ) return;

			sdir.copy( vB ).multiplyScalar( uvC.y ).addScaledVector( vC, - uvB.y ).multiplyScalar( r );
			tdir.copy( vC ).multiplyScalar( uvB.x ).addScaledVector( vB, - uvC.x ).multiplyScalar( r );

			tan1[ a ].add( sdir );
			tan1[ b ].add( sdir );
			tan1[ c ].add( sdir );

			tan2[ a ].add( tdir );
			tan2[ b ].add( tdir );
			tan2[ c ].add( tdir );

		}

		let groups = this.groups;

		if ( groups.length === 0 ) {

			groups = [ {
				start: 0,
				count: indices.length
			} ];

		}

		for ( let i = 0, il = groups.length; i < il; ++ i ) {

			const group = groups[ i ];

			const start = group.start;
			const count = group.count;

			for ( let j = start, jl = start + count; j < jl; j += 3 ) {

				handleTriangle(
					indices[ j + 0 ],
					indices[ j + 1 ],
					indices[ j + 2 ]
				);

			}

		}

		const tmp = new Vector3(), tmp2 = new Vector3();
		const n = new Vector3(), n2 = new Vector3();

		function handleVertex( v ) {

			n.fromArray( normals, v * 3 );
			n2.copy( n );

			const t = tan1[ v ];

			// Gram-Schmidt orthogonalize

			tmp.copy( t );
			tmp.sub( n.multiplyScalar( n.dot( t ) ) ).normalize();

			// Calculate handedness

			tmp2.crossVectors( n2, t );
			const test = tmp2.dot( tan2[ v ] );
			const w = ( test < 0.0 ) ? - 1.0 : 1.0;

			tangents[ v * 4 ] = tmp.x;
			tangents[ v * 4 + 1 ] = tmp.y;
			tangents[ v * 4 + 2 ] = tmp.z;
			tangents[ v * 4 + 3 ] = w;

		}

		for ( let i = 0, il = groups.length; i < il; ++ i ) {

			const group = groups[ i ];

			const start = group.start;
			const count = group.count;

			for ( let j = start, jl = start + count; j < jl; j += 3 ) {

				handleVertex( indices[ j + 0 ] );
				handleVertex( indices[ j + 1 ] );
				handleVertex( indices[ j + 2 ] );

			}

		}

	}

	/**
	 *
	 * @description 通过面片法向量的平均值计算每个顶点的法向量
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @memberof BufferGeometry
	 */
	computeVertexNormals() {

		const index = this.index;
		const positionAttribute = this.getAttribute( 'position' );

		if ( positionAttribute !== undefined ) {

			let normalAttribute = this.getAttribute( 'normal' );

			if ( normalAttribute === undefined ) {

				normalAttribute = new BufferAttribute( new Float32Array( positionAttribute.count * 3 ), 3 );
				this.setAttribute( 'normal', normalAttribute );

			} else {

				// reset existing normals to zero

				for ( let i = 0, il = normalAttribute.count; i < il; i ++ ) {

					normalAttribute.setXYZ( i, 0, 0, 0 );

				}

			}

			const pA = new Vector3(), pB = new Vector3(), pC = new Vector3();
			const nA = new Vector3(), nB = new Vector3(), nC = new Vector3();
			const cb = new Vector3(), ab = new Vector3();

			// indexed elements

			if ( index ) {

				for ( let i = 0, il = index.count; i < il; i += 3 ) {

					const vA = index.getX( i + 0 );
					const vB = index.getX( i + 1 );
					const vC = index.getX( i + 2 );

					pA.fromBufferAttribute( positionAttribute, vA );
					pB.fromBufferAttribute( positionAttribute, vB );
					pC.fromBufferAttribute( positionAttribute, vC );

					cb.subVectors( pC, pB );
					ab.subVectors( pA, pB );
					cb.cross( ab );

					nA.fromBufferAttribute( normalAttribute, vA );
					nB.fromBufferAttribute( normalAttribute, vB );
					nC.fromBufferAttribute( normalAttribute, vC );

					nA.add( cb );
					nB.add( cb );
					nC.add( cb );

					normalAttribute.setXYZ( vA, nA.x, nA.y, nA.z );
					normalAttribute.setXYZ( vB, nB.x, nB.y, nB.z );
					normalAttribute.setXYZ( vC, nC.x, nC.y, nC.z );

				}

			} else {

				// non-indexed elements (unconnected triangle soup)

				for ( let i = 0, il = positionAttribute.count; i < il; i += 3 ) {

					pA.fromBufferAttribute( positionAttribute, i + 0 );
					pB.fromBufferAttribute( positionAttribute, i + 1 );
					pC.fromBufferAttribute( positionAttribute, i + 2 );

					cb.subVectors( pC, pB );
					ab.subVectors( pA, pB );
					cb.cross( ab );

					normalAttribute.setXYZ( i + 0, cb.x, cb.y, cb.z );
					normalAttribute.setXYZ( i + 1, cb.x, cb.y, cb.z );
					normalAttribute.setXYZ( i + 2, cb.x, cb.y, cb.z );

				}

			}

			this.normalizeNormals();

			normalAttribute.needsUpdate = true;

		}

	}

	/**
	 *
	 * @description 同参数指定的 BufferGeometry 进行合并。
	 * 可以通过可选参数指定，从哪个偏移位置开始进行 merge。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} geometry
	 * @param {*} offset
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	merge( geometry, offset ) {

		if ( ! ( geometry && geometry.isBufferGeometry ) ) {

			console.error( 'THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.', geometry );
			return;

		}

		if ( offset === undefined ) {

			offset = 0;

			console.warn(
				'THREE.BufferGeometry.merge(): Overwriting original geometry, starting at offset=0. '
				+ 'Use BufferGeometryUtils.mergeBufferGeometries() for lossless merge.'
			);

		}

		const attributes = this.attributes;

		for ( const key in attributes ) {

			if ( geometry.attributes[ key ] === undefined ) continue;

			const attribute1 = attributes[ key ];
			const attributeArray1 = attribute1.array;

			const attribute2 = geometry.attributes[ key ];
			const attributeArray2 = attribute2.array;

			const attributeOffset = attribute2.itemSize * offset;
			const length = Math.min( attributeArray2.length, attributeArray1.length - attributeOffset );

			for ( let i = 0, j = attributeOffset; i < length; i ++, j ++ ) {

				attributeArray1[ j ] = attributeArray2[ i ];

			}

		}

		return this;

	}

	/**
	 *
	 * @description 几何体中的每个法向量长度将会为 1。
	 * 这样操作会更正光线在表面的效果。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @memberof BufferGeometry
	 */
	normalizeNormals() {

		const normals = this.attributes.normal;

		for ( let i = 0, il = normals.count; i < il; i ++ ) {

			_vector.fromBufferAttribute( normals, i );

			_vector.normalize();

			normals.setXYZ( i, _vector.x, _vector.y, _vector.z );

		}

	}

	/**
	 *
	 * @description 返回已索引的 BufferGeometry 的非索引版本
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @return {*} 
	 * @memberof BufferGeometry
	 */
	toNonIndexed() {

		function convertBufferAttribute( attribute, indices ) {

			const array = attribute.array;
			const itemSize = attribute.itemSize;
			const normalized = attribute.normalized;

			const array2 = new array.constructor( indices.length * itemSize );

			let index = 0, index2 = 0;

			for ( let i = 0, l = indices.length; i < l; i ++ ) {

				if ( attribute.isInterleavedBufferAttribute ) {

					index = indices[ i ] * attribute.data.stride + attribute.offset;

				} else {

					index = indices[ i ] * itemSize;

				}

				for ( let j = 0; j < itemSize; j ++ ) {

					array2[ index2 ++ ] = array[ index ++ ];

				}

			}

			return new BufferAttribute( array2, itemSize, normalized );

		}

		//

		if ( this.index === null ) {

			console.warn( 'THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.' );
			return this;

		}

		const geometry2 = new BufferGeometry();

		const indices = this.index.array;
		const attributes = this.attributes;

		// attributes

		for ( const name in attributes ) {

			const attribute = attributes[ name ];

			const newAttribute = convertBufferAttribute( attribute, indices );

			geometry2.setAttribute( name, newAttribute );

		}

		// morph attributes

		const morphAttributes = this.morphAttributes;

		for ( const name in morphAttributes ) {

			const morphArray = [];
			const morphAttribute = morphAttributes[ name ]; // morphAttribute: array of Float32BufferAttributes

			for ( let i = 0, il = morphAttribute.length; i < il; i ++ ) {

				const attribute = morphAttribute[ i ];

				const newAttribute = convertBufferAttribute( attribute, indices );

				morphArray.push( newAttribute );

			}

			geometry2.morphAttributes[ name ] = morphArray;

		}

		geometry2.morphTargetsRelative = this.morphTargetsRelative;

		// groups

		const groups = this.groups;

		for ( let i = 0, l = groups.length; i < l; i ++ ) {

			const group = groups[ i ];
			geometry2.addGroup( group.start, group.count, group.materialIndex );

		}

		return geometry2;

	}

	toJSON() {

		const data = {
			metadata: {
				version: 4.5,
				type: 'BufferGeometry',
				generator: 'BufferGeometry.toJSON'
			}
		};

		// standard BufferGeometry serialization

		data.uuid = this.uuid;
		data.type = this.type;
		if ( this.name !== '' ) data.name = this.name;
		if ( Object.keys( this.userData ).length > 0 ) data.userData = this.userData;

		if ( this.parameters !== undefined ) {

			const parameters = this.parameters;

			for ( const key in parameters ) {

				if ( parameters[ key ] !== undefined ) data[ key ] = parameters[ key ];

			}

			return data;

		}

		// for simplicity the code assumes attributes are not shared across geometries, see #15811

		data.data = { attributes: {} };

		const index = this.index;

		if ( index !== null ) {

			data.data.index = {
				type: index.array.constructor.name,
				array: Array.prototype.slice.call( index.array )
			};

		}

		const attributes = this.attributes;

		for ( const key in attributes ) {

			const attribute = attributes[ key ];

			data.data.attributes[ key ] = attribute.toJSON( data.data );

		}

		const morphAttributes = {};
		let hasMorphAttributes = false;

		for ( const key in this.morphAttributes ) {

			const attributeArray = this.morphAttributes[ key ];

			const array = [];

			for ( let i = 0, il = attributeArray.length; i < il; i ++ ) {

				const attribute = attributeArray[ i ];

				array.push( attribute.toJSON( data.data ) );

			}

			if ( array.length > 0 ) {

				morphAttributes[ key ] = array;

				hasMorphAttributes = true;

			}

		}

		if ( hasMorphAttributes ) {

			data.data.morphAttributes = morphAttributes;
			data.data.morphTargetsRelative = this.morphTargetsRelative;

		}

		const groups = this.groups;

		if ( groups.length > 0 ) {

			data.data.groups = JSON.parse( JSON.stringify( groups ) );

		}

		const boundingSphere = this.boundingSphere;

		if ( boundingSphere !== null ) {

			data.data.boundingSphere = {
				center: boundingSphere.center.toArray(),
				radius: boundingSphere.radius
			};

		}

		return data;

	}

	clone() {

		 return new this.constructor().copy( this );

	}

	copy( source ) {

		// reset

		this.index = null;
		this.attributes = {};
		this.morphAttributes = {};
		this.groups = [];
		this.boundingBox = null;
		this.boundingSphere = null;

		// used for storing cloned, shared data

		const data = {};

		// name

		this.name = source.name;

		// index

		const index = source.index;

		if ( index !== null ) {

			this.setIndex( index.clone( data ) );

		}

		// attributes

		const attributes = source.attributes;

		for ( const name in attributes ) {

			const attribute = attributes[ name ];
			this.setAttribute( name, attribute.clone( data ) );

		}

		// morph attributes

		const morphAttributes = source.morphAttributes;

		for ( const name in morphAttributes ) {

			const array = [];
			const morphAttribute = morphAttributes[ name ]; // morphAttribute: array of Float32BufferAttributes

			for ( let i = 0, l = morphAttribute.length; i < l; i ++ ) {

				array.push( morphAttribute[ i ].clone( data ) );

			}

			this.morphAttributes[ name ] = array;

		}

		this.morphTargetsRelative = source.morphTargetsRelative;

		// groups

		const groups = source.groups;

		for ( let i = 0, l = groups.length; i < l; i ++ ) {

			const group = groups[ i ];
			this.addGroup( group.start, group.count, group.materialIndex );

		}

		// bounding box

		const boundingBox = source.boundingBox;

		if ( boundingBox !== null ) {

			this.boundingBox = boundingBox.clone();

		}

		// bounding sphere

		const boundingSphere = source.boundingSphere;

		if ( boundingSphere !== null ) {

			this.boundingSphere = boundingSphere.clone();

		}

		// draw range

		this.drawRange.start = source.drawRange.start;
		this.drawRange.count = source.drawRange.count;

		// user data

		this.userData = source.userData;

		// geometry generator parameters

		if ( source.parameters !== undefined ) this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	/**
	 * @description 从内存中销毁对象。
	 * 如果在运行是需要从内存中删除 BufferGeometry，则需要调用该函数。
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @memberof BufferGeometry
	 */
	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

BufferGeometry.prototype.isBufferGeometry = true;

export { BufferGeometry };
