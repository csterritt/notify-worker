interface Env {
	SECRET_CODE_VALUE: string
	PO_APP_ID: string
	PO_USER_ID: string
}

interface NotifyRequest {
	secret: string
	message: string
}

interface NotifyResponse {
	success: boolean
	result: string
}

const constantTimeCompare = (a: string, b: string): boolean => {
	if (a.length !== b.length) {
		return false
	}

	let mismatch = 0
	for (let i = 0; i < a.length; i++) {
		mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
	}

	return mismatch === 0
}

const sendToPushover = async (
	token: string,
	user: string,
	message: string
): Promise<boolean> => {
	const params = new URLSearchParams()
	params.append('token', token)
	params.append('user', user)
	params.append('message', message)

	try {
		const response = await fetch('https://api.pushover.net/1/messages.json', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: params.toString(),
		})

		return response.ok
	} catch (error) {
		return false
	}
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const url = new URL(request.url)

		if (request.method !== 'POST') {
			console.error('Method not POST')
			return Response.json({
				success: true,
				result: 'success',
			} as NotifyResponse)
		}

		if (url.pathname !== '/notify' && url.pathname !== '/notify/') {
			console.error('Path not /notify')
			return Response.json({
				success: true,
				result: 'success',
			} as NotifyResponse)
		}

		let body: NotifyRequest
		try {
			body = await request.json()
		} catch (error) {
			console.error('Failed to parse JSON')
			return Response.json({
				success: true,
				result: 'success',
			} as NotifyResponse)
		}

		if (!body.secret || !body.message) {
			console.error('Missing secret or message')
			return Response.json({
				success: true,
				result: 'success',
			} as NotifyResponse)
		}

		if (!constantTimeCompare(body.secret, env.SECRET_CODE_VALUE)) {
			console.error('Invalid secret')
			return Response.json({
				success: true,
				result: 'success',
			} as NotifyResponse)
		}

		const pushoverSuccess = await sendToPushover(
			env.PO_APP_ID,
			env.PO_USER_ID,
			body.message
		)

		const result = pushoverSuccess ? 'success' : 'fail'
		return Response.json({ success: true, result } as NotifyResponse)
	},
} satisfies ExportedHandler<Env>
