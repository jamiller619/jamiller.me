import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
	CanvasTexture,
	Color,
	Group,
	MathUtils,
	Mesh,
	Quaternion,
	ShaderMaterial,
	SRGBColorSpace,
	Texture,
	TextureLoader,
	Vector3,
} from 'three';
import styles from './Scene.module.css';

const mockImages = [
	new URL('../../assets/blog-placeholder-1.jpg', import.meta.url).href,
	new URL('../../assets/blog-placeholder-2.jpg', import.meta.url).href,
	new URL('../../assets/blog-placeholder-3.jpg', import.meta.url).href,
	new URL('../../assets/blog-placeholder-4.jpg', import.meta.url).href,
	new URL('../../assets/blog-placeholder-5.jpg', import.meta.url).href,
	new URL('../../assets/blog-placeholder-about.jpg', import.meta.url).href,
] as const;

const projects = [
	{ title: 'Xon', image: mockImages[0], colors: ['#7c3aed', '#ec4899', '#312e81'] },
	{ title: 'Repose', image: mockImages[1], colors: ['#2563eb', '#06b6d4', '#172554'] },
	{ title: 'Suzy', image: mockImages[2], colors: ['#84cc16', '#14b8a6', '#134e4a'] },
	{ title: 'Jamiller.me', image: mockImages[3], colors: ['#f97316', '#eab308', '#713f12'] },
	{ title: 'Field Notes', image: mockImages[4], colors: ['#db2777', '#f43f5e', '#4c0519'] },
	{ title: 'Interface Study', image: mockImages[5], colors: ['#0891b2', '#6366f1', '#312e81'] },
	{ title: 'Open Source', image: mockImages[0], colors: ['#eab308', '#f97316', '#7c2d12'] },
	{ title: 'Experiments', image: mockImages[1], colors: ['#dc2626', '#9333ea', '#581c87'] },
] as const;

const projectImageUrls = projects.map((project) => project.image);

function createCardTexture(image: HTMLImageElement) {
	const canvas = document.createElement('canvas');
	canvas.width = 1200;
	canvas.height = 900;

	const context = canvas.getContext('2d');
	if (!context) throw new Error('Unable to create project card texture.');

	const imageWidth = image.naturalWidth || image.width;
	const imageHeight = image.naturalHeight || image.height;
	const scale = Math.max(canvas.width / imageWidth, canvas.height / imageHeight);
	const width = imageWidth * scale;
	const height = imageHeight * scale;

	context.drawImage(
		image,
		(canvas.width - width) / 2,
		(canvas.height - height) / 2,
		width,
		height,
	);

	const overlay = context.createLinearGradient(0, 0, 0, canvas.height);
	overlay.addColorStop(0, 'rgba(0, 0, 0, 0.02)');
	overlay.addColorStop(0.55, 'rgba(0, 0, 0, 0.08)');
	overlay.addColorStop(1, 'rgba(0, 0, 0, 0.82)');
	context.fillStyle = overlay;
	context.fillRect(0, 0, canvas.width, canvas.height);

	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}

function createTitleTexture(title: string) {
	const canvas = document.createElement('canvas');
	canvas.width = 1200;
	canvas.height = 900;

	const context = canvas.getContext('2d');
	if (!context) throw new Error('Unable to create project title texture.');

	context.fillStyle = '#fff';
	context.font = '700 86px sans-serif';
	context.letterSpacing = '-3px';
	context.shadowColor = 'rgba(0, 0, 0, 0.45)';
	context.shadowBlur = 18;
	context.fillText(title, 70, canvas.height - 70, canvas.width - 140);

	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}

const vertexShader = `
	varying vec2 vUv;

	void main() {
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

const fragmentShader = `
	uniform float uTime;
	uniform vec3 uColorA;
	uniform vec3 uColorB;
	uniform vec3 uColorC;
	uniform sampler2D uCardTexture;
	varying vec2 vUv;

	void main() {
		vec2 glowCenter = vec2(
			0.5 + sin(uTime * 0.16) * 0.22,
			0.5 + cos(uTime * 0.13) * 0.22
		);
		float sweep = 0.5 + 0.5 * sin(
			(vUv.x * 0.8 + vUv.y * 0.55) * 3.14159 + uTime * 0.18
		);
		float glow = 1.0 - smoothstep(0.0, 0.85, distance(vUv, glowCenter));

		vec3 gradient = mix(uColorC, uColorA, vUv.y * 0.65 + 0.2);
		gradient = mix(gradient, uColorB, smoothstep(0.08, 0.92, sweep) * 0.72);
		gradient += glow * 0.12;
		vec3 card = texture2D(uCardTexture, vUv).rgb;

		gl_FragColor = vec4(mix(card, gradient, 0.14), 1.0);
	}
`;

const globeRadius = 14;
const latitudeLimit = 0.42;
const columnCount = 24;
const rowsPerColumn = 4;
const animationSpeed = 0.5;
const globeRotationSpeed = 0.04 * animationSpeed;
const forward = new Vector3(0, 0, 1);

interface ProjectCardProps {
	columnIndex: number;
	projectIndex: number;
	slotIndex: number;
	title: string;
	colors: readonly [string, string, string];
	texture: Texture;
	titleTexture: Texture;
}

function ProjectCard({
	columnIndex,
	projectIndex,
	slotIndex,
	title,
	colors,
	texture,
	titleTexture,
}: ProjectCardProps) {
	const group = useRef<Group>(null);
	const card = useRef<Mesh>(null);
	const titleLayer = useRef<Mesh>(null);
	const material = useRef<ShaderMaterial>(null);
	const hovered = useRef(false);
	const hoverProgress = useRef(0);
	const normal = useMemo(() => new Vector3(), []);
	const orientation = useMemo(() => new Quaternion(), []);
	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uColorA: { value: new Color(colors[0]) },
			uColorB: { value: new Color(colors[1]) },
			uColorC: { value: new Color(colors[2]) },
			uCardTexture: { value: texture },
		}),
		[colors, texture],
	);

	useFrame(({ clock }, delta) => {
		if (
			!group.current ||
			!card.current ||
			!titleLayer.current ||
			!material.current
		) return;

		const elapsed = clock.getElapsedTime();
		const animationTime = elapsed * animationSpeed;
		const direction = columnIndex % 2 === 0 ? 1 : -1;
		const cycle = latitudeLimit * 2;
		const initialLatitude =
			-latitudeLimit + ((slotIndex + 0.5) / rowsPerColumn) * cycle;
		const unwrappedLatitude =
			initialLatitude + direction * animationTime * 0.0125;
		const latitude =
			((((unwrappedLatitude + latitudeLimit) % cycle) + cycle) % cycle) -
			latitudeLimit;
		const longitude = -Math.PI + (columnIndex / columnCount) * Math.PI * 2;

		group.current.position.set(
			globeRadius * Math.sin(longitude),
			globeRadius * Math.sin(latitude),
			globeRadius * Math.cos(longitude),
		);

		normal.set(Math.sin(longitude), 0, Math.cos(longitude));
		orientation.setFromUnitVectors(forward, normal);
		group.current.quaternion.copy(orientation);

		hoverProgress.current = MathUtils.damp(
			hoverProgress.current,
			hovered.current ? 1 : 0,
			8,
			delta,
		);
		card.current.position.z = hoverProgress.current * 0.55;
		card.current.scale.setScalar(1 + hoverProgress.current * 0.14);
		titleLayer.current.position.z = 0.06 + hoverProgress.current * 0.85;
		titleLayer.current.scale.setScalar(1 + hoverProgress.current * 0.08);
		material.current.uniforms.uTime.value =
			animationTime + projectIndex * 0.8;
	});

	return (
		<group
			ref={group}
			name={title}
			onPointerOut={() => {
				hovered.current = false;
				document.documentElement.style.cursor = '';
			}}
			onPointerOver={(event) => {
				event.stopPropagation();
				hovered.current = true;
				document.documentElement.style.cursor = 'pointer';
			}}
		>
			<mesh ref={card}>
				<planeGeometry args={[2.55, 1.9125, 1, 1]} />
				<shaderMaterial
					ref={material}
					fragmentShader={fragmentShader}
					uniforms={uniforms}
					vertexShader={vertexShader}
				/>
			</mesh>
			<mesh ref={titleLayer} position={[0, 0, 0.06]}>
				<planeGeometry args={[2.55, 1.9125, 1, 1]} />
				<meshBasicMaterial
					alphaTest={0.01}
					depthWrite={false}
					map={titleTexture}
					toneMapped={false}
					transparent
				/>
			</mesh>
		</group>
	);
}

function PortfolioGrid() {
	const globe = useRef<Group>(null);
	const sourceTextures = useLoader(TextureLoader, projectImageUrls);
	const cardTextures = useMemo(
		() =>
			sourceTextures.map((texture) =>
				createCardTexture(texture.image as HTMLImageElement),
			),
		[sourceTextures],
	);
	const titleTextures = useMemo(
		() => projects.map((project) => createTitleTexture(project.title)),
		[],
	);

	useEffect(
		() => () => {
			cardTextures.forEach((texture) => texture.dispose());
			titleTextures.forEach((texture) => texture.dispose());
		},
		[cardTextures, titleTextures],
	);

	useFrame(({ clock }) => {
		if (globe.current) {
			globe.current.rotation.y =
				clock.getElapsedTime() * globeRotationSpeed;
		}
	});

	return (
		<group ref={globe} position={[0, 0, -globeRadius]}>
			{Array.from({ length: columnCount }, (_, columnIndex) =>
				Array.from({ length: rowsPerColumn }, (_, slotIndex) => {
					const projectSetStart =
						(columnIndex % 2) * rowsPerColumn;
					const stagger =
						Math.floor(columnIndex / 2) % rowsPerColumn;
					const projectIndex =
						projectSetStart +
						((slotIndex + stagger) % rowsPerColumn);
					const project = projects[projectIndex];

					return (
						<ProjectCard
							colors={project.colors}
							columnIndex={columnIndex}
							key={`${columnIndex}-${slotIndex}`}
							projectIndex={projectIndex}
							slotIndex={slotIndex}
							texture={cardTextures[projectIndex]}
							title={project.title}
							titleTexture={titleTextures[projectIndex]}
						/>
					);
				}),
			)}
		</group>
	);
}

export default function Scene() {
	return (
		<section className={styles.root} aria-label="Selected work">
			<ul className="sr-only">
				{projects.map((project) => (
					<li key={project.title}>{project.title}</li>
				))}
			</ul>
			<Canvas
				camera={{ position: [0, 0, 9.2], fov: 43 }}
				dpr={[1, 2]}
				gl={{ alpha: true, antialias: true }}
			>
				<PortfolioGrid />
			</Canvas>
		</section>
	);
}
